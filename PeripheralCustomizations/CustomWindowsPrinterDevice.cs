namespace Microsoft.Dynamics
{
    namespace Contoso.HardwareStation.Peripherals
    {
        using System;
        using System.Collections.Generic;
        using Microsoft.Dynamics.Commerce.HardwareStation;
        using Microsoft.Dynamics.Commerce.HardwareStation.Peripherals;
        using Microsoft.Dynamics.Commerce.Runtime.Handlers;
        using Microsoft.Dynamics.Commerce.Runtime.Messages;
        using System.IO;
        using QRCoder;
        using System.Linq;
        using System.Text.RegularExpressions;
        //using System.DrawingCore.Printing;
        //using System.DrawingCore;
        //using ZXing;
        //using ZXing.Common;
        //using ZXing.ZKWeb;
        //using System.DrawingCore.Drawing2D;
        //using System.DrawingCore.Imaging;
        using System.Windows.Forms;
        using System.Drawing.Printing;
        using System.Drawing;
        using System.Drawing.Drawing2D;
        using System.Drawing.Imaging;

        /// <summary>
        /// Class implements windows based printer driver for hardware station.
        /// </summary>
#pragma warning disable CS0618 // JUSTIFICATION: Pending migration to asynchronous APIs.
        public class CustomWindowsPrinterDevice : INamedRequestHandler
#pragma warning restore CS0618
        {
            private const string BarCodeRegEx = "<B: (.+?)>";
            private const string NormalTextMarker = "|1C";
            private const string BoldTextMarker = "|2C";
            private const string DoubleSizeNormalTextMarker = "|3C";
            private const string DoubleSizeBoldTextMarker = "|4C";

            private const string ExceptNormalMarkersRegEx = @"\|2C|\|3C|\|4C";
            private const string AllMarkersForSplitRegEx = @"(\|1C|\|2C|\|3C|\|4C)";

            private List<TextPart> parts;
            private int printLine;
            private Barcode barCode = new BarcodeCode39();
            private DefaultLogo defaultLogo = new DefaultLogo();

            /// <summary>
            /// Gets the esc marker.
            /// </summary>
            public static string EscMarker
            {
                get
                {
                    return "&#x1B;";
                }
            }

            /// <summary>
            /// Gets the unique name for this request handler.
            /// </summary>
            public string HandlerName
            {
                get { return PeripheralType.Windows; }
            }

            /// <summary>
            /// Gets the collection of supported request types by this handler.
            /// </summary>
            public IEnumerable<Type> SupportedRequestTypes
            {
                get
                {
                    return new[]
                    {
                    typeof(OpenPrinterDeviceRequest),
                    typeof(PrintPrinterDeviceRequest),
                    typeof(ClosePrinterDeviceRequest)
                };
                }
            }

            /// <summary>
            /// Gets or sets the printer name.
            /// </summary>
            protected string PrinterName { get; set; }

            /// <summary>
            /// Represents the entry point for the printer device request handler.
            /// </summary>
            /// <param name="request">The incoming request message.</param>
            /// <returns>The outgoing response message.</returns>
            public Response Execute(Request request)
            {
                ThrowIf.Null(request, nameof(request));

                Type requestType = request.GetType();

                if (requestType == typeof(OpenPrinterDeviceRequest))
                {
                    var openRequest = (OpenPrinterDeviceRequest)request;

                    this.Open(openRequest.DeviceName);
                }
                else if (requestType == typeof(PrintPrinterDeviceRequest))
                {
                    var printRequest = (PrintPrinterDeviceRequest)request;

                    this.Print(
                        printRequest.Header,
                        printRequest.Lines,
                        printRequest.Footer);
                }
                else if (requestType == typeof(ClosePrinterDeviceRequest))
                {
                    // Do nothing. Just for support of the close request type.
                }
                else
                {
                    throw new NotSupportedException(string.Format("Request '{0}' is not supported.", requestType));
                }

                NullResponse nullResponse = NullResponse.Instance;

                return nullResponse;
            }

            private static bool DrawBitmapImage(PrintPageEventArgs e, byte[] defaultLogoBytes, float contentWidth, ref float y)
            {
                using (MemoryStream ms = new MemoryStream(defaultLogoBytes))
                {
                    var image = Image.FromStream(ms);

                    if (y + image.Height >= e.MarginBounds.Height)
                    {
                        // No more room - advance to next page
                        e.HasMorePages = true;
                        return false;
                    }

                    float center = ((contentWidth - image.Width) / 2.0f) + e.MarginBounds.Left;
                    if (center < 0)
                    {
                        center = 0;
                    }

                    float top = e.MarginBounds.Top + y;

                    e.Graphics.DrawImage(image, center, top);

                    y += image.Height;

                    return true;
                }
            }

            /// <summary>
            /// Opens a peripheral.
            /// </summary>
            /// <param name="peripheralName">Name of the peripheral.</param>
            private void Open(string peripheralName)
            {
                this.PrinterName = peripheralName;
            }

            /// <summary>
            /// Print the data on printer.
            /// </summary>
            /// <param name="header">The header.</param>
            /// <param name="lines">The lines.</param>
            /// <param name="footer">The footer.</param>
            private void Print(string header, string lines, string footer)
            {
                string textToPrint = header + lines + footer;

                if (!string.IsNullOrWhiteSpace(textToPrint))
                {
                    using (PrintDocument printDoc = new PrintDocument())
                    {
                        printDoc.PrinterSettings.PrinterName = this.PrinterName;
                        string subString = textToPrint.Replace(EscMarker, string.Empty);
                        var printText = subString.Split(new string[] { Environment.NewLine }, StringSplitOptions.None);

                        this.parts = new List<TextPart>();
                        foreach (var line in printText)
                        {
                            var lineParts = TextLogoParser.Parse(line);
                            if (null != lineParts)
                            {
                                this.parts.AddRange(lineParts);
                            }
                        }

                        this.printLine = 0;


                        printDoc.PrintPage += new PrintPageEventHandler(this.PrintPageHandler);

                        try
                        {
                            printDoc.Print();
                        }
                        catch (InvalidPrinterException)
                        {
                            throw new PeripheralException(PeripheralException.PeripheralNotFound);
                        }
                    }
                }
            }

            /// <summary>
            /// Prints the page.
            /// </summary>
            /// <param name="sender">The sender.</param>
            /// <param name="e">The <see cref="PrintPageEventArgs" /> instance containing the event data.</param>
            private void PrintPageHandler(object sender, PrintPageEventArgs e)
            {
                const int LineHeight = 15;
                int TextFontSize = 8;
                const string TextFontName = "Calibri";
                const int DoubleSizeTextFontSize = 14;

                e.HasMorePages = false;
                using (Font textFont = new Font(TextFontName, TextFontSize, FontStyle.Regular))
                using (Font textFontBold = new Font(TextFontName, TextFontSize, FontStyle.Bold))
                using (Font doubleSizeTextFont = new Font(TextFontName, DoubleSizeTextFontSize, FontStyle.Regular))
                using (Font doubleSizeTextFontBold = new Font(TextFontName, DoubleSizeTextFontSize, FontStyle.Bold))
                {
                    float y = 0;
                    float dpiXRatio = e.Graphics.DpiX / 96f;
                    float dpiYRatio = e.Graphics.DpiY / 96f;

                    // This calculation isn't exactly the width of the rendered text.
                    // All the calculations occurring in the rendering code of PrintTextLine.  It almost needs to run that code and use e.Graphics.MeasureString()
                    // the first time to get the true contentWidth, then re-run the same logic using the true contentWidth for rendering.
                    //
                    // The rendering is close, but it's not 'exact' center due to the mismatch in estimated vs. true size
                    float contentWidth = this.parts.Where(x => x.TextType == TextType.Text)
                                                    .Select(p => p.Value)
                                                    .Max(str => str.Replace(NormalTextMarker, string.Empty)
                                                                    .Replace(BoldTextMarker, string.Empty)
                                                                    .Replace(DoubleSizeNormalTextMarker, string.Empty)
                                                                    .Replace(DoubleSizeBoldTextMarker, string.Empty)
                                                                    .Length)
                                            * dpiXRatio; // Line with max length = content width

                    for (; this.printLine < this.parts.Count; this.printLine++)
                    {
                        var part = this.parts[this.printLine];

                        if (part.TextType == TextType.Text)
                        {
                            if (!this.PrintTextLine(
                                                    e,
                                                    LineHeight,
                                                    textFont,
                                                    textFontBold,
                                                    doubleSizeTextFont,
                                                    doubleSizeTextFontBold,
                                                    dpiYRatio,
                                                    contentWidth,
                                                    dpiXRatio,
                                                    part.Value,
                                                    ref y))
                            {
                                return;
                            }
                        }
                        else if (part.TextType == TextType.LegacyLogo)
                        {
                            byte[] defaultLogoBytes = this.defaultLogo.GetBytes();
                            if (!DrawBitmapImage(e, defaultLogoBytes, contentWidth, ref y))
                            {
                                return;
                            }
                        }
                        else if (part.TextType == TextType.LogoWithBytes)
                        {
                            byte[] image = TextLogoParser.GetLogoImageBytes(part.Value);
                            if (!DrawBitmapImage(e, image, contentWidth, ref y))
                            {
                                return;
                            }
                        }
                    }
                }
            }

            private bool PrintTextLine(
                            PrintPageEventArgs e,
                            int lineHeight,
                            Font textFont,
                            Font textFontBold,
                            Font doubleSizeTextFont,
                            Font doubleSizeTextFontBold,
                            float dpiYRatio,
                            float contentWidth,
                            float dpiXRatio,
                            string line,
                            ref float y)
            {
                // <CFZ>


                int leftMargin = 0, rightMargin = 0;
                Image image = null;

                Image imagelogo = null;   //  Code for Receipt Alignment

                if (line.Contains("RetailPOSLogo") && (line.Length > 10))
                {
                    line = string.Empty;

                    if (File.Exists("C:\\RetailPOSLogo\\RetailPOSLogo.jpg"))
                    {
                        imagelogo = Image.FromFile("C:\\RetailPOSLogo\\RetailPOSLogo.jpg");
                    }
                }
                // </CFZ>
                // it always use one line height
                // because the Report designer use a col and a line to set position for all conrtols
                if (y + lineHeight >= e.MarginBounds.Height)
                {
                    // No more room - advance to next page
                    e.HasMorePages = true;
                    return false;
                }

                //CFZ FBR QR Code
                // CFZ FBR QR Code
                if (line.Contains("FBRID") && (line.Length > 10))
                {
                    string textcode = (line.Replace("FBRID", string.Empty)).Replace(NormalTextMarker, string.Empty).Trim();

                    using (QRCodeGenerator qrGenerator = new QRCodeGenerator())
                    {
                        QRCodeData qrCodeData = qrGenerator.CreateQrCode(textcode.ToString(), QRCodeGenerator.ECCLevel.Q);

                        using (QRCode qrCode = new QRCode(qrCodeData))
                        {
                            using (Bitmap qrCodeImage = qrCode.GetGraphic(20))
                            {
                                using (Image resizedImage = CFZResizeImage((Image)qrCodeImage, 80, 80))
                                {
                                    image = (Image)resizedImage.Clone();
                                }
                            }
                        }
                    }

                    line = "";
                }

                //CFZ FBR Logo Code
                Image imageFBRlogo = null;   //  Code for Receipt Alignment

                if (line.Contains("FBRLOGO") && (line.Length > 10))
                {
                    line = string.Empty;

                    if (File.Exists("C:\\RetailPOSLogo\\FBRLogo.jpg"))
                    {
                        using (Image tempImage = Image.FromFile("C:\\RetailPOSLogo\\FBRLogo.jpg"))
                        {
                            using (Image resizedImage = CFZResizeImage(tempImage, 70, 70))
                            {
                                imageFBRlogo = (Image)resizedImage.Clone();
                            }
                        }
                    }
                }

                //CFZ FBR Logo Code

                bool hasFontModificator = (line.Length > 0) && Regex.IsMatch(line, ExceptNormalMarkersRegEx, RegexOptions.Compiled);
                if (hasFontModificator)
                {
                    // Text line printing with bold Text in it.
                    float x = 0;
                    Font currentFont = textFont;
                    int sizeFactor = 1;

                    string[] subStrings = Regex.Split(line, AllMarkersForSplitRegEx, RegexOptions.Compiled);
                    foreach (string subString in subStrings)
                    {
                        switch (subString)
                        {
                            case NormalTextMarker:
                                currentFont = textFont;
                                sizeFactor = 1;
                                break;
                            case BoldTextMarker:
                                currentFont = textFontBold;
                                sizeFactor = 2;
                                break;
                            case DoubleSizeNormalTextMarker:
                                currentFont = doubleSizeTextFont;
                                sizeFactor = 1;
                                break;
                            case DoubleSizeBoldTextMarker:
                                currentFont = doubleSizeTextFontBold;
                                sizeFactor = 2;
                                break;
                            default:
                                if (!string.IsNullOrEmpty(subString))
                                {
                                    // <CFZ>
                                    e.Graphics.DrawString(subString, currentFont, Brushes.Black, x + leftMargin, y + rightMargin);
                                    // </CFZ>
                                    x = x + (subString.Length * sizeFactor * 6);
                                }

                                break;
                        }
                    }
                }
                else
                {

                    // Text line printing with no bold Text and no double size Text in it.
                    string subString = line.Replace(NormalTextMarker, string.Empty);
                    //CFZ logo
                    if ((imagelogo != null))
                    {
                        e.Graphics.DrawImage(imagelogo, (float)((contentWidth - (((float)imagelogo.Width) / dpiXRatio)) / 2) + leftMargin - 60, y + rightMargin);
                        //e.Graphics.DrawImage(barcodeImage, ((contentWidth - (barcodeImage.Width / dpiXRatio)) / 2) + leftMargin, y + rightMargin);
                    }
                    //CFZ End logo
                    //CFZ FBR
                    if ((image != null))
                    {
                        e.Graphics.DrawImage(image, (float)((contentWidth - (((float)image.Width) / dpiXRatio)) / 2) + leftMargin + 25, y + rightMargin - 10);
                        //e.Graphics.DrawImage(barcodeImage, ((contentWidth - (barcodeImage.Width / dpiXRatio)) / 2) + leftMargin, y + rightMargin);
                    }
                    //CFZ End FBR2
                    //CFZ FBR logo
                    if ((imageFBRlogo != null))
                    {
                        e.Graphics.DrawImage(imageFBRlogo, (float)((contentWidth - (((float)imageFBRlogo.Width) / dpiXRatio)) / 2) + leftMargin - 70, y + rightMargin - 40);
                        //e.Graphics.DrawImage(barcodeImage, ((contentWidth - (barcodeImage.Width / dpiXRatio)) / 2) + leftMargin, y + rightMargin);
                    }
                    //CFZ END FBR logo
                    Match barCodeMarkerMatch = Regex.Match(subString, BarCodeRegEx, RegexOptions.Compiled | RegexOptions.IgnoreCase);

                    if (barCodeMarkerMatch.Success)
                    {
                        // Get the receiptId
                        subString = barCodeMarkerMatch.Groups[1].ToString();
                        float x = e.Graphics.DpiX;
                        float xy = e.Graphics.DpiY;
                        using (Image barcodeImage = this.Create(subString, x, xy))
                        {
                            if (barcodeImage != null)
                            {
                                float barcodeHeight = barcodeImage.Height / dpiYRatio;

                                if (y + barcodeHeight >= e.MarginBounds.Height)
                                {
                                    // No more room - advance to next page
                                    e.HasMorePages = true;
                                    return true;
                                }

                                // Render barcode in the center of receipt.
                                // <CFZ>
                                e.Graphics.DrawImage(barcodeImage, ((contentWidth - (barcodeImage.Width / dpiXRatio)) / 2) + leftMargin + 20, y + rightMargin);
                                //</cfz>
                                y += barcodeHeight;
                            }
                        }
                    }
                    else
                    {
                        // <CFZ>
                        //e.Graphics.DrawString(subString, textFont, Brushes.Black, e.MarginBounds.Left, y + e.MarginBounds.Top);
                        e.Graphics.DrawString(subString, textFont, Brushes.Black, leftMargin, y + rightMargin);
                        // </CFZ>
                    }
                }

                y = y + lineHeight;
                return true;
            }
            public virtual Image Create(string text, float xDpi, float yDpi)
            {

                Bitmap barcodeImage = null;
                string FontName = "BC C39 2 to 1 HD Wide";
                int FontSize = 50;
                using (Font barcodeFont = new Font(FontName, FontSize))
                {
                    if (barcodeFont.Name.Equals(barcodeFont.OriginalFontName, StringComparison.Ordinal)) // If font installed.  
                    {
                        using (Font barcodeTextFont = new Font("Courier New", 10)) // Text font
                        {
                            try
                            {
                                text = this.barCode.Encode(text);

                                SizeF barcodeSizeF = GetTextSizeF(text, barcodeFont, xDpi, yDpi);
                                float barcodeTextHeight = barcodeTextFont.GetHeight(yDpi);

                                barcodeImage = new Bitmap((int)barcodeSizeF.Width, (int)(barcodeSizeF.Height + barcodeTextHeight));
                                barcodeImage.SetResolution(xDpi, yDpi);

                                using (Graphics graphic = Graphics.FromImage(barcodeImage))
                                {
                                    // Calculate left/right margin for drawing barcode considering dpi being used.
                                    float XYWithMargin = (xDpi / (float)96) * 5;

                                    // Draw barcode
                                    graphic.DrawString(text, barcodeFont, Brushes.Black, XYWithMargin, XYWithMargin);

                                    // Draw text below barcode in center
                                    RectangleF textRect = new RectangleF(0, barcodeSizeF.Height, barcodeSizeF.Width, barcodeTextHeight);
                                    using (StringFormat textFormat = new StringFormat(StringFormatFlags.NoClip) { Alignment = StringAlignment.Center })
                                    {
                                        graphic.DrawString(text, barcodeTextFont, Brushes.Black, textRect, textFormat);
                                    }
                                }
                            }
                            catch (Exception ex)
                            {
                                if (barcodeImage != null)
                                {
                                    var ddd= ex.Message;
                                    barcodeImage.Dispose();
                                }

                            }
                        }
                    }

                }

                return barcodeImage;
            }

            private static SizeF GetTextSizeF(string text, Font font, float xDpi, float yDpi)
            {
                SizeF sizeF;

                // Create temporary graphics and calculate the height/width
                using (Bitmap bitmap = new Bitmap(1, 1))
                {
                    bitmap.SetResolution(xDpi, yDpi);
                    using (Graphics graphic = Graphics.FromImage(bitmap))
                    {
                        sizeF = graphic.MeasureString(text, font);
                    }
                }

                return sizeF;
            }

            // CFZ Code FBR
            public Bitmap CFZResizeImage(Image image, int width, int height)
            {
                var destRect = new Rectangle(0, 0, width, height);
                var destImage = new Bitmap(width, height);

                destImage.SetResolution(image.HorizontalResolution, image.VerticalResolution);

                using (var graphics = Graphics.FromImage(destImage))
                {
                    graphics.CompositingMode = CompositingMode.SourceCopy;
                    graphics.CompositingQuality = CompositingQuality.HighQuality;
                    graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    graphics.SmoothingMode = SmoothingMode.HighQuality;
                    graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;

                    using (var wrapMode = new ImageAttributes())
                    {
                        wrapMode.SetWrapMode(WrapMode.TileFlipXY);
                        graphics.DrawImage(image, destRect, 0, 0, image.Width, image.Height, GraphicsUnit.Pixel, wrapMode);
                    }
                }

                return destImage;
            }
            //CFZ FBR End
        }
    }
}