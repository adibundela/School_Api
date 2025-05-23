const db = require('../db/connection')
exports.addSchool = async (req,res) =>{
    const {name,address,latitude,longitude} = req.body;
    if(!name||!address||isNaN(latitude)||isNaN(longitude)){
        return res.status(400).json({error:"Invalid input "})
    }
    try {
        await db.execute('INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',[name,address,latitude,longitude])
        res.status(201).json({
            massage:"school added succesfully"
        })
    }
    catch(err){
        res.status(500).json({ error: 'Database error', details: err.message })
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = x => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

exports.listSchools = async(req,res)=>{
    const{latitude,longitude} = req.query;
    if(isNaN(latitude)||isNaN(longitude)){
        return res.status(400).json({
            error:"invalid cordinates"
        })
    }
    try{
        const [schools] =await db.execute('SELECT * FROM schools')
        const sortedSchools = schools.map(school=>{
            const dist = calculateDistance(longitude,latitude,school.longitude,school.latitude);
            return {...school,dist}
        }).sort((a,b)=>a.dist-b.dist)
        res.json({
            sortedSchools
        })
    }
    catch(err){
        res.status(500).json({
            error:'Database error',
            details: err.massage
        })
    }
}