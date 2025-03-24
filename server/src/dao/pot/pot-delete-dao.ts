import PotModel from '../../models/Pot';


async function deletePot(id: string) {
    await PotModel.findByIdAndDelete(id); 
}

export default deletePot; 
