import PotModel from '../../models/Pot';


async function deletePot(id: string) {
    await PotModel.findByIdAndDelete(id); 
    return true;
}

export default deletePot; 
