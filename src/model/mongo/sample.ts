import mongoose from "mongoose";

const sampleSchema = {
  message: String,
};

const schemaInstance = new mongoose.Schema(sampleSchema);
const SampleModel = mongoose.model("sample", schemaInstance);

export default SampleModel;
