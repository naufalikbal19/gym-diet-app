// Diet engine — generates daily meal plans based on goal, BMR, and body composition

const mealDB = {
  // Easy-to-cook Indonesian-friendly meals
  breakfast: {
    cut: [
      { name: 'Telur Rebus + Roti Gandum', cal: 320, protein: 22, carbs: 30, fat: 10, prep: '10 menit', ingredients: ['3 butir telur', '2 lembar roti gandum', '1 buah tomat'] },
      { name: 'Oatmeal + Pisang + Susu Rendah Lemak', cal: 350, protein: 12, carbs: 55, fat: 6, prep: '5 menit', ingredients: ['60g oatmeal', '1 buah pisang', '200ml susu rendah lemak'] },
      { name: 'Smoothie Protein (Pisang + Susu + Putih Telur)', cal: 300, protein: 25, carbs: 35, fat: 5, prep: '5 menit', ingredients: ['1 pisang', '3 putih telur', '200ml susu skim', 'es batu'] },
      { name: 'Wrap Telur Sayur', cal: 280, protein: 18, carbs: 28, fat: 9, prep: '10 menit', ingredients: ['2 telur', '1 tortilla gandum', 'bayam, wortel', '1 sdm saus sambal rendah kalori'] },
    ],
    bulk: [
      { name: 'Nasi + Telur Dadar + Ayam Suwir', cal: 650, protein: 45, carbs: 70, fat: 15, prep: '15 menit', ingredients: ['150g nasi putih', '2 telur', '100g dada ayam suwir', 'kecap manis sedikit'] },
      { name: 'Oatmeal Kental + 3 Telur Scramble + Susu', cal: 580, protein: 38, carbs: 65, fat: 16, prep: '10 menit', ingredients: ['80g oatmeal', '3 telur', '200ml susu full cream', 'madu 1 sdm'] },
      { name: 'Roti Gandum + Selai Kacang + Pisang + Susu', cal: 550, protein: 20, carbs: 75, fat: 18, prep: '5 menit', ingredients: ['3 lembar roti gandum', '2 sdm selai kacang', '1 pisang', '250ml susu'] },
    ],
    maintain: [
      { name: 'Telur Orak-arik + Nasi Tim + Sayur', cal: 420, protein: 25, carbs: 45, fat: 12, prep: '15 menit', ingredients: ['2 telur', '100g nasi tim', 'brokoli, wortel', 'bumbu minimalis'] },
      { name: 'Oatmeal + Buah Segar + Greek Yogurt', cal: 380, protein: 15, carbs: 55, fat: 8, prep: '5 menit', ingredients: ['50g oatmeal', '150g greek yogurt', 'stroberi/blueberry', 'madu'] },
    ],
    toning: [
      { name: 'Smoothie Bowl (Buah + Granola + Chia Seed)', cal: 340, protein: 12, carbs: 50, fat: 10, prep: '10 menit', ingredients: ['1 pisang beku', '100g mixed berry', '2 sdm granola', '1 sdt chia seed', 'susu almond'] },
      { name: 'Telur Rebus + Avokad + Roti Gandum', cal: 360, protein: 18, carbs: 28, fat: 18, prep: '10 menit', ingredients: ['2 telur rebus', '½ avokad', '2 lembar roti gandum', 'lemon juice'] },
    ],
  },
  lunch: {
    cut: [
      { name: 'Dada Ayam Panggang + Brokoli + Nasi Merah', cal: 450, protein: 42, carbs: 45, fat: 8, prep: '20 menit', ingredients: ['150g dada ayam', '100g brokoli', '100g nasi merah', 'bumbu bakar rendah lemak'] },
      { name: 'Ikan Kukus + Sayur Tumis + Nasi', cal: 420, protein: 38, carbs: 42, fat: 9, prep: '20 menit', ingredients: ['150g ikan nila/mujair', '100g sayur campur', '100g nasi putih', 'jahe, daun jeruk'] },
      { name: 'Capcay Ayam Rendah Minyak', cal: 380, protein: 32, carbs: 35, fat: 10, prep: '15 menit', ingredients: ['100g ayam', 'wortel, kol, sawi, jamur', 'bawang putih', '½ sdm minyak wijen', '100g nasi'] },
    ],
    bulk: [
      { name: 'Nasi + Rendang Sapi (Porsi Besar)', cal: 750, protein: 50, carbs: 80, fat: 22, prep: '30 menit', ingredients: ['200g nasi putih', '150g daging sapi', 'bumbu rendang instan', 'santan lite'] },
      { name: 'Nasi + Ayam Goreng + Tempe + Sayur', cal: 700, protein: 48, carbs: 75, fat: 20, prep: '20 menit', ingredients: ['200g nasi', '150g ayam', '100g tempe', 'sayur bayam'] },
      { name: 'Pasta Tuna + Sayuran', cal: 680, protein: 45, carbs: 78, fat: 14, prep: '20 menit', ingredients: ['150g pasta gandum', '1 kaleng tuna', 'tomat, paprika', 'bawang putih', 'olive oil'] },
    ],
    maintain: [
      { name: 'Nasi + Ikan Bakar + Lalapan', cal: 520, protein: 38, carbs: 55, fat: 12, prep: '25 menit', ingredients: ['130g nasi', '150g ikan', 'lalapan mentah', 'sambal tomat'] },
      { name: 'Ayam Teriyaki + Nasi + Edamame', cal: 500, protein: 40, carbs: 52, fat: 11, prep: '20 menit', ingredients: ['130g dada ayam', '130g nasi', '80g edamame', 'kecap manis, jahe'] },
    ],
    toning: [
      { name: 'Salad Ayam Panggang + Quinoa', cal: 420, protein: 38, carbs: 35, fat: 12, prep: '20 menit', ingredients: ['120g dada ayam', '80g quinoa', 'selada, tomat, mentimun', 'olive oil + lemon dressing'] },
      { name: 'Sup Tahu Sayur + Nasi Merah', cal: 380, protein: 22, carbs: 48, fat: 9, prep: '20 menit', ingredients: ['150g tahu', 'wortel, buncis, labu', '100g nasi merah', 'kaldu jamur'] },
    ],
  },
  dinner: {
    cut: [
      { name: 'Tumis Tahu Tempe + Sayur + Nasi Sedikit', cal: 380, protein: 28, carbs: 35, fat: 12, prep: '15 menit', ingredients: ['100g tahu', '100g tempe', 'bayam, kangkung', '80g nasi', 'bawang, cabai'] },
      { name: 'Sup Ayam Sayur Tanpa Nasi', cal: 280, protein: 30, carbs: 15, fat: 8, prep: '20 menit', ingredients: ['150g ayam', 'wortel, buncis, seledri', 'bawang putih, jahe', 'kaldu ayam rendah sodium'] },
      { name: 'Pepes Ikan + Tempe Bakar', cal: 320, protein: 35, carbs: 10, fat: 12, prep: '25 menit', ingredients: ['150g ikan', '100g tempe', 'kemangi, tomat', 'daun pisang', '80g nasi'] },
    ],
    bulk: [
      { name: 'Nasi + Ayam + Telur + Sayur', cal: 700, protein: 52, carbs: 72, fat: 18, prep: '25 menit', ingredients: ['200g nasi', '150g ayam', '2 telur', 'brokoli, wortel'] },
      { name: 'Mie Goreng Protein (Mie Gandum + Ayam + Telur)', cal: 650, protein: 42, carbs: 70, fat: 16, prep: '15 menit', ingredients: ['150g mie gandum', '100g ayam', '2 telur', 'sayur, kecap manis'] },
    ],
    maintain: [
      { name: 'Ikan Goreng Minimalis + Nasi + Lalapan', cal: 480, protein: 35, carbs: 50, fat: 14, prep: '20 menit', ingredients: ['150g ikan', '130g nasi', 'lalapan', 'sambal bawang'] },
      { name: 'Tumis Kangkung + Tahu + Nasi', cal: 420, protein: 22, carbs: 55, fat: 11, prep: '15 menit', ingredients: ['200g kangkung', '150g tahu', '130g nasi', 'terasi, bawang'] },
    ],
    toning: [
      { name: 'Sup Sayuran + Telur Rebus (Low Carb)', cal: 280, protein: 20, carbs: 18, fat: 10, prep: '15 menit', ingredients: ['brokoli, wortel, jamur', '2 telur rebus', 'kaldu sayur', 'lada hitam'] },
      { name: 'Grilled Fish + Tumis Sayur', cal: 320, protein: 38, carbs: 12, fat: 10, prep: '20 menit', ingredients: ['180g ikan', 'buncis, paprika', '1 sdm olive oil', 'bawang putih, lemon'] },
    ],
  },
  snack: {
    cut: [
      { name: 'Pisang + 10 Almond', cal: 180, protein: 4, carbs: 28, fat: 6, prep: '0 menit', ingredients: ['1 buah pisang', '10 butir almond'] },
      { name: 'Greek Yogurt Rendah Lemak', cal: 120, protein: 14, carbs: 10, fat: 2, prep: '0 menit', ingredients: ['150g greek yogurt', 'sedikit madu'] },
      { name: 'Edamame Rebus', cal: 150, protein: 12, carbs: 12, fat: 5, prep: '5 menit', ingredients: ['150g edamame segar/frozen'] },
    ],
    bulk: [
      { name: 'Roti Gandum + Selai Kacang + Susu', cal: 400, protein: 18, carbs: 45, fat: 16, prep: '2 menit', ingredients: ['2 roti gandum', '2 sdm selai kacang', '200ml susu'] },
      { name: 'Protein Bar / Protein Shake', cal: 350, protein: 30, carbs: 30, fat: 8, prep: '2 menit', ingredients: ['1 scoop whey protein', '300ml susu', '1 pisang'] },
      { name: 'Kacang Campur + Kurma', cal: 300, protein: 10, carbs: 32, fat: 14, prep: '0 menit', ingredients: ['30g kacang campur', '3 butir kurma'] },
    ],
    maintain: [
      { name: 'Buah Segar Campur', cal: 150, protein: 2, carbs: 35, fat: 1, prep: '5 menit', ingredients: ['pepaya, semangka, nanas'] },
      { name: 'Tahu Kukus + Kecap Rendah Sodium', cal: 160, protein: 14, carbs: 5, fat: 8, prep: '10 menit', ingredients: ['150g tahu', 'kecap asin sedikit', 'daun bawang'] },
    ],
    toning: [
      { name: 'Apel + Selai Kacang (1 sdm)', cal: 180, protein: 4, carbs: 28, fat: 7, prep: '2 menit', ingredients: ['1 buah apel', '1 sdm selai kacang natural'] },
      { name: 'Smoothie Hijau (Bayam + Pisang + Susu Almond)', cal: 160, protein: 5, carbs: 28, fat: 4, prep: '5 menit', ingredients: ['1 genggam bayam', '½ pisang', '200ml susu almond'] },
    ],
  },
}

function pick(arr, n = 1) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return n === 1 ? shuffled[0] : shuffled.slice(0, n)
}

export function generateWeeklyDiet({ goal = 'cut', bmr = 1600, bodyFat, gender }) {
  const g = mealDB.breakfast[goal] ? goal : 'maintain'

  // Calorie target
  const calTarget = goal === 'cut'
    ? Math.round(bmr * 0.8)
    : goal === 'bulk'
    ? Math.round(bmr * 1.2)
    : Math.round(bmr)

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu', 'Minggu']

  return days.map(day => {
    const breakfast = pick(mealDB.breakfast[g])
    const lunch = pick(mealDB.lunch[g])
    const dinner = pick(mealDB.dinner[g])
    const snack = pick(mealDB.snack[g])
    const totalCal = breakfast.cal + lunch.cal + dinner.cal + snack.cal
    const totalProtein = breakfast.protein + lunch.protein + dinner.protein + snack.protein
    const totalCarbs = breakfast.carbs + lunch.carbs + dinner.carbs + snack.carbs
    const totalFat = breakfast.fat + lunch.fat + dinner.fat + snack.fat

    return {
      day,
      calTarget,
      totalCal,
      totalProtein,
      totalCarbs,
      totalFat,
      meals: {
        breakfast: { ...breakfast, time: '07:00' },
        snack1: { ...snack, time: '10:00' },
        lunch: { ...lunch, time: '12:30' },
        snack2: { ...pick(mealDB.snack[g]), time: '15:30' },
        dinner: { ...dinner, time: '19:00' },
      },
    }
  })
}
