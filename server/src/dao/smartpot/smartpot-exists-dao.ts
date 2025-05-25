import SmartPotModel from "../../models/SmartPot";

async function smartpotExistsDao(serial_number: string) {
  const smartpot = await SmartPotModel.findOne({ serial_number });
  return !!smartpot;
}

export default smartpotExistsDao;
