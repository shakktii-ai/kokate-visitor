import Worker from "@/models/worker";
import connectDb from "@/middleware/mongoose";

const handler = async (req, res) => {
  // ── GET: list workers with search, filter, pagination ────────────────
  if (req.method === "GET") {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        position = "",
        sort = "newest",
      } = req.query;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      const query = {};

      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: "i" } },
          { middleName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { primaryPhone: { $regex: search, $options: "i" } },
          { alternativePhone: { $regex: search, $options: "i" } },
          { village: { $regex: search, $options: "i" } },
          { areaNameOrBooth: { $regex: search, $options: "i" } },
          { position: { $regex: search, $options: "i" } },
        ];
      }

      if (position) {
        query.position = position;
      }

      const sortOrder = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

      const [workers, total] = await Promise.all([
        Worker.find(query)
          .sort(sortOrder)
          .skip(skip)
          .limit(limitNum),
        Worker.countDocuments(query),
      ]);

      return res.status(200).json({
        success: true,
        workers,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error) {
      console.error("Error fetching workers:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch workers." });
    }
  }

  // ── DELETE: remove a worker by id ────────────────────────────────────
  if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ success: false, error: "Worker ID is required." });
      }
      const deleted = await Worker.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: "Worker not found." });
      }
      return res.status(200).json({ success: true, message: "Worker deleted successfully." });
    } catch (error) {
      console.error("Error deleting worker:", error);
      return res.status(500).json({ success: false, error: "Failed to delete worker." });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed." });
};

export default connectDb(handler);
