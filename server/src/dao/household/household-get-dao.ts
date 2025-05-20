import HOUSEHOLD_MODEL from '../../models/Household'
async function householdGetDao(id: string) {
  return await HOUSEHOLD_MODEL.findById(id)
    .populate('invites', 'name surname email')
    .populate('members', 'name surname email')
    .populate('owner', 'name surname email')
}

export default householdGetDao
