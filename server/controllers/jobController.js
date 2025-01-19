import Job from "../models/JobModel.js";

// Get All Jobs
export async function getAllJobs(req, res) {
  try {
    const jobs = await Job.find({ visible: true }).populate({
      path: "companyId",
      select: "-password",
    });
    return res.json({ success: true, jobs });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Get Single Job By ID
export async function getJobById(req, res) {
  try {
    const { id } = req.params;
    const job = await Job.findById(id).populate({
      path: "companyId",
      select: "-password",
    });
    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: "Job not found!" });
    }
    return res.json({ success: true, message: "Displaying Job by ID", job });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
