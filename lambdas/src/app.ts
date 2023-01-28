import cors from "cors";
import express, { Request, Response } from "express";
import path from "path";
import compression from "compression";
import { getCurrentInvoke } from "@vendia/serverless-express";
import {inventoryService, organizationService} from "./database/services";
import Audit from "./models/Audit";
import Organization from "./models/Organization";
import Audit from "./models/Audit";
import Organization from "./models/Organization";
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const params = {
  TableName: process.env.DYNAMODB_TABLE
};

const ejs = require("ejs").__express;
const app = express();
const router = express.Router();

app.set("view engine", "ejs");
app.engine(".ejs", ejs);

router.use(compression());
router.use(cors());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// NOTE: tests can't find the views directory without this
app.set("views", path.join(__dirname, "views"));

router.get("/", (req: Request, res: Response) => {
  const currentInvoke = getCurrentInvoke();
  const { event = {} } = currentInvoke;
  const { requestContext = {} } = event;
  const { domainName = "localhost:3000" } = requestContext;
  const apiUrl = `https://${domainName}`;
  return res.render("index", {
    apiUrl,
  });
});

router.get("/protected/inventory", async (req: Request, res: Response) => {
    const posts = await inventoryService.getAllInventorys();
    console.log("Fetching data from dynamo db - ", posts)
    return res.json(posts);
});

// router.get("/users", (req: Request, res: Response) => {
//   return res.json(users);
// });

// router.get("/users/:userId", (req: Request, res: Response) => {
//   const user = getUser(req.params.userId);

//   if (!user) return res.status(404).json({});

//   return res.json(user);
// });

router.post("/protected/inventory", async (req: Request, res: Response) => {
  try {
    // const inventoryId: string = uuid.v4();
    const post = await inventoryService.createInventory(req.body);
    //   {
    //   id: "1",
    //   orgId: "2",
    //   name: "string",
    //   image: true,
    //   location: "sg",
    //   type: "appliances",
    //   audit: {
    //     createdAt:"test",
    //     createdBy:"test"
    //   },
    //   organization: {
    //     Id:"1",
    //     orgId:"2",
    //     "name":"testorg"
    //   },
    // });

    return res.status(201).json(post);
  } catch (err) {
    return res.status(400).json(err);
  }
});
router.post("/protected/:inventoryId/workorder", async (req: Request, res: Response) => {
  try {
    // const inventoryId: string = uuid.v4();
    console.log("The partial order that s passed is - ", req.params.inventoryId, req.body)
    const post = await inventoryService.createWorkOrder(req.params.inventoryId, req.body);

    return res.status(201).json(post);
  } catch (err) {
    return res.status(400).json(err);
  }
});
// router.put("/users/:userId", (req: Request, res: Response) => {
//   const user = getUser(req.params.userId);

//   if (!user) return res.status(404).json({});

//   user.name = req.body.name;
//   return res.json(user);
// });

// router.delete("/users/:userId", (req: Request, res: Response) => {
//   const userIndex = getUserIndex(req.params.userId);

//   if (userIndex === -1) return res.status(404).json({});

//   users.splice(userIndex, 1);
//   return res.json(users);
// });

// let userIdCounter = users.length;

// The serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000)
app.use("/", router);

export { app };