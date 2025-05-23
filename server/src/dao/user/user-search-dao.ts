import USER_MODEL from "../../models/User";

async function userSearchDao(query: string) {
  return await USER_MODEL.find({
    email: { $regex: query, $options: "i" }, // case-insensitive match
  })
    .select("email name surname")
    .lean();
}
export default userSearchDao;
