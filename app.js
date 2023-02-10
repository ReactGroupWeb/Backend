const { config } = require("dotenv");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

const CONNECTION_STRING =
  "mongodb+srv://admin:admin@cluster0.zazsc8d.mongodb.net/A3Shop?retryWrites=true&w=majority";
const PORT = process.env.Port || 5000;

app.use(cors());
app.options("*", cors());

//middleware
app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use("/public/upload", express.static(__dirname + "/public/upload"));
app.use(errorHandler);

//Routes
const slidersRouter = require("./routers/sliders");
const productsRouter = require("./routers/products");
const categoriesRouter = require("./routers/categories");
const ordersRouter = require("./routers/orders");
const usersRouter = require("./routers/users");
const companyRouter = require("./routers/companies");
const shoppingcart = require("./routers/shoppingcarts");

const api = process.env.API_URL;

app.use(`${api}/sliders`, slidersRouter);
app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/companys`, companyRouter);
app.use(`${api}/shoppingcarts`, shoppingcart);

//Database
mongoose.set("strictQuery", false);
// mongoose.set("useFindAndModify", false);
mongoose
  .connect(CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // strictQuery:false,
    // strictQuery:true,
    dbName: "A3Shop",
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
  })
  .catch((err) => {
    console.log(err.message);
  });

//Server
// app.listen(3000,()=>{
//     console.log(`server is running on port: ${PORT}`);
// })
