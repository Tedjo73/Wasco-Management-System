const coreDb = require('./backend/db/core');

async function seed() {
    try {
        console.log('Seeding Districts...');
        const districts = ['Maseru', 'Berea', 'Leribe', 'Butha-Buthe', 'Mokhotlong', 'Thaba-Tseka', "Qacha's Nek", 'Quthing', "Mohale's Hoek", 'Mafeteng'];
        
        for (const name of districts) {
            await coreDb.query("INSERT INTO districts (name) VALUES ($1) ON CONFLICT (name) DO NOTHING", [name]);
        }
        
        console.log('Assigning Maseru to existing customers...');
        const maseru = await coreDb.query("SELECT district_id FROM districts WHERE name = 'Maseru'");
        const maseruId = maseru.rows[0].district_id;
        
        await coreDb.query("UPDATE customers SET district_id = $1 WHERE district_id IS NULL", [maseruId]);
        
        console.log('Done!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
seed();
