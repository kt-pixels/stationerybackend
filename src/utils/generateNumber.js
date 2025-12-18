import Counter from "../../models/Counter.model.js";

export const generateNumber = async (type) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const counter = await Counter.findOneAndUpdate(
    { name: `${type}-${year}-${month}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seq = String(counter.seq).padStart(6, "0");

  return `${type}-${year}-${month}-${seq}`;
};
