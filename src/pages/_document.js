// src/pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* Add GoMaps CDN Script here */}
          <Script
            src="https://cdn.gomaps.pro/js/gomaps.js"
            strategy="beforeInteractive"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
