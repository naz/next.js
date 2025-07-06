import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import Pet from "../../../models/Pet";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const {
    query: { id },
    method,
  } = req;

  await dbConnect();

  switch (method) {
    case "GET" /* Get a model by its ID */:
      try {
        const pet = await Pet.findById(id);
        if (!pet) {
          return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: pet });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    case "PUT" /* Edit a model by its ID */:
      try {
        const allowedFields = ["name", "age", "species"]; // Define allowed fields
        const sanitizedBody = Object.keys(req.body)
          .filter((key) => allowedFields.includes(key))
          .reduce((obj, key) => {
            obj[key] = req.body[key];
            return obj;
          }, {});
        const pet = await Pet.findByIdAndUpdate(id, sanitizedBody, {
          new: true,
          runValidators: true,
        });
        if (!pet) {
          return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: pet });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    case "DELETE" /* Delete a model by its ID */:
      try {
        if (typeof id !== "string" || !id.match(/^[0-9a-fA-F]{24}$/)) {
          return res.status(400).json({ success: false, message: "Invalid ID format" });
        }
        const deletedPet = await Pet.deleteOne({ _id: { $eq: id } });
        if (!deletedPet) {
          return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}
