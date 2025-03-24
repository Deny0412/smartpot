import HOUSEHOLD_MODEL from "../../models/Household";
import { IHousehold } from "../../models/Household";

class HouseholdDAO {
  async create(data: IHousehold) {
    return await HOUSEHOLD_MODEL.create(data);
  }
  async get(id: string) {
    return await HOUSEHOLD_MODEL.findById(id);
  }
  async update(id: string, updateData: Partial<IHousehold>) {
    return await HOUSEHOLD_MODEL.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  }
  async delete(id: string) {
    return await HOUSEHOLD_MODEL.findByIdAndDelete(id);
  }

  async list(): Promise<IHousehold[]>;
  async list(user_id: string): Promise<IHousehold[]>;

  async list(user_id?: string): Promise<IHousehold[]> {
    if (user_id) {
      return await HOUSEHOLD_MODEL.find({
        $or: [{ owner: user_id }, { members: user_id }],
      });
    }
    return await HOUSEHOLD_MODEL.find();
  }
}

export default new HouseholdDAO();
