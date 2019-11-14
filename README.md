**FreeCodeCamp**- Information Security and Quality Assurance
------

Project Stock Price Checker

1) SET NODE_ENV to `test` without quotes and set DB to your monog connection string
3) You will add any security features to `server.js`
4) You will create all of the functional/unit tests in `tests/2_functional-tests.js` and `tests/1_unit-tests.js`


<div id="serstories">
    <h3>User Stories</h3>
    <ol>
      <li>Set the content security policies to only allow loading of scripts and CSS from your server.</li>
      <li>I can <b>GET</b> <code>/api/stock-prices</code> with form data containing a Nasdaq <i>stock</i> ticker and
        recieve back an object <i>stockData</i>.</li>
      <li>In <i>stockData</i>, I can see the <i>stock</i> (the ticker as a string), <i>price</i> (decimal in string format),
        and <i>likes</i> (int).</li>
      <li>I can also pass along the field <i>like</i> as <b>true</b> (boolean) to have my like added to the stock(s). Only 1
        like per IP should be accepted.</li>
      <li>If I pass along 2 stocks, the return object will be an array with information about both stocks. Instead of
        <i>likes</i>, it will display <i>rel_likes</i> (the difference between the likes) on both.</li>
      <li>A good way to receive current prices is through our stock price proxy (replacing 'GOOG' with your stock symbol):
        <code>https://repeated-alpaca.glitch.me/v1/stock/GOOG/quote</code></li>
      <li>All 5 functional tests are complete and passing.</li>
    </ol>
    <h3>Example usage:</h3>
    <code>/api/stock-prices?stock=GOOG</code><br>
    <code>/api/stock-prices?stock=GOOG&amp;like=true</code><br>
    <code>/api/stock-prices?stock=GOOG&amp;stock=MSFT</code><br>
    <code>/api/stock-prices?stock=GOOG&amp;stock=MSFT&amp;like=true</code><br>
    <h3>Example return:</h3>
    <code>{"stockData":{"stock":"GOOG","price":"786.90","likes":1}}</code><br>
    <code>{"stockData":[{"stock":"MSFT","price":"62.30","rel_likes":-1},{"stock":"GOOG","price":"786.90","rel_likes":1}]}</code>
  </div>