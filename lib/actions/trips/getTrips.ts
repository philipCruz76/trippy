import db from "@/lib/db";


export default async function getTrips() {
try{
    const response = await db.tripDetails.findMany({
        include: {
            user: true
        }
    })

    return response;
}catch(error){
    console.error('Error fetching trips:', error);
    return null;
}

}