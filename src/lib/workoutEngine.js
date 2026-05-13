// Workout engine — generates weekly routine based on BodyIn data & client goal

const exerciseDB = {
  // { name, sets, reps, rest, category, level }
  cut: {
    upper: [
      { name: 'Push-up', sets: 4, reps: '15-20', rest: '45s', cat: 'Chest' },
      { name: 'Dumbbell Bench Press', sets: 4, reps: '12-15', rest: '60s', cat: 'Chest' },
      { name: 'Cable Fly', sets: 3, reps: '15', rest: '45s', cat: 'Chest' },
      { name: 'Pull-up / Lat Pulldown', sets: 4, reps: '10-12', rest: '60s', cat: 'Back' },
      { name: 'Seated Row', sets: 3, reps: '12-15', rest: '60s', cat: 'Back' },
      { name: 'Face Pull', sets: 3, reps: '15', rest: '45s', cat: 'Rear Delt' },
      { name: 'Lateral Raise', sets: 3, reps: '15-20', rest: '45s', cat: 'Shoulder' },
      { name: 'Dumbbell Shoulder Press', sets: 3, reps: '12', rest: '60s', cat: 'Shoulder' },
      { name: 'Tricep Pushdown', sets: 3, reps: '15', rest: '45s', cat: 'Triceps' },
      { name: 'Dumbbell Curl', sets: 3, reps: '15', rest: '45s', cat: 'Biceps' },
    ],
    lower: [
      { name: 'Goblet Squat', sets: 4, reps: '15', rest: '60s', cat: 'Quads' },
      { name: 'Romanian Deadlift', sets: 3, reps: '12', rest: '60s', cat: 'Hamstring' },
      { name: 'Walking Lunge', sets: 3, reps: '12/leg', rest: '60s', cat: 'Quads' },
      { name: 'Leg Press', sets: 4, reps: '15-20', rest: '60s', cat: 'Quads' },
      { name: 'Leg Curl', sets: 3, reps: '15', rest: '45s', cat: 'Hamstring' },
      { name: 'Calf Raise', sets: 4, reps: '20', rest: '30s', cat: 'Calves' },
      { name: 'Hip Thrust', sets: 3, reps: '15', rest: '60s', cat: 'Glutes' },
    ],
    cardio: [
      { name: 'Treadmill Incline Walk', sets: 1, reps: '30 menit', rest: '-', cat: 'Cardio' },
      { name: 'Jump Rope', sets: 5, reps: '2 menit', rest: '30s', cat: 'Cardio' },
      { name: 'Rowing Machine', sets: 1, reps: '20 menit', rest: '-', cat: 'Cardio' },
      { name: 'Cycling (Stationary)', sets: 1, reps: '25 menit', rest: '-', cat: 'Cardio' },
      { name: 'HIIT (Burpee + Mountain Climber)', sets: 4, reps: '40 detik on / 20 detik off', rest: '60s antar sirkuit', cat: 'Cardio HIIT' },
    ],
    core: [
      { name: 'Plank', sets: 3, reps: '60 detik', rest: '30s', cat: 'Core' },
      { name: 'Crunches', sets: 3, reps: '20', rest: '30s', cat: 'Core' },
      { name: 'Leg Raise', sets: 3, reps: '15', rest: '30s', cat: 'Core' },
      { name: 'Russian Twist', sets: 3, reps: '20', rest: '30s', cat: 'Core' },
    ],
  },
  bulk: {
    upper: [
      { name: 'Barbell Bench Press', sets: 5, reps: '5', rest: '2-3 menit', cat: 'Chest' },
      { name: 'Incline Dumbbell Press', sets: 4, reps: '8-10', rest: '90s', cat: 'Chest' },
      { name: 'Weighted Pull-up', sets: 4, reps: '6-8', rest: '2 menit', cat: 'Back' },
      { name: 'Bent-over Barbell Row', sets: 4, reps: '8', rest: '90s', cat: 'Back' },
      { name: 'Overhead Press', sets: 4, reps: '8', rest: '90s', cat: 'Shoulder' },
      { name: 'Dumbbell Lateral Raise', sets: 3, reps: '12', rest: '60s', cat: 'Shoulder' },
      { name: 'Close-grip Bench Press', sets: 3, reps: '10', rest: '60s', cat: 'Triceps' },
      { name: 'Barbell Curl', sets: 3, reps: '10', rest: '60s', cat: 'Biceps' },
    ],
    lower: [
      { name: 'Barbell Back Squat', sets: 5, reps: '5', rest: '3 menit', cat: 'Quads' },
      { name: 'Deadlift', sets: 4, reps: '5', rest: '3 menit', cat: 'Posterior Chain' },
      { name: 'Leg Press', sets: 4, reps: '10', rest: '90s', cat: 'Quads' },
      { name: 'Bulgarian Split Squat', sets: 3, reps: '8/leg', rest: '90s', cat: 'Quads' },
      { name: 'Leg Curl', sets: 3, reps: '10', rest: '60s', cat: 'Hamstring' },
      { name: 'Standing Calf Raise', sets: 4, reps: '15', rest: '45s', cat: 'Calves' },
    ],
    cardio: [
      { name: 'Jalan Santai', sets: 1, reps: '20 menit', rest: '-', cat: 'Cardio Ringan' },
      { name: 'Cycling Low Intensity', sets: 1, reps: '15 menit', rest: '-', cat: 'Cardio Ringan' },
    ],
    core: [
      { name: 'Ab Wheel Rollout', sets: 3, reps: '10', rest: '60s', cat: 'Core' },
      { name: 'Weighted Plank', sets: 3, reps: '45 detik', rest: '30s', cat: 'Core' },
      { name: 'Cable Crunch', sets: 3, reps: '15', rest: '45s', cat: 'Core' },
    ],
  },
  maintain: {
    upper: [
      { name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', rest: '60s', cat: 'Chest' },
      { name: 'Pull-up', sets: 3, reps: '8-10', rest: '60s', cat: 'Back' },
      { name: 'Seated Row', sets: 3, reps: '10', rest: '60s', cat: 'Back' },
      { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10', rest: '60s', cat: 'Shoulder' },
      { name: 'Tricep Dip', sets: 3, reps: '12', rest: '45s', cat: 'Triceps' },
      { name: 'Hammer Curl', sets: 3, reps: '12', rest: '45s', cat: 'Biceps' },
    ],
    lower: [
      { name: 'Barbell Squat', sets: 3, reps: '10', rest: '90s', cat: 'Quads' },
      { name: 'Romanian Deadlift', sets: 3, reps: '10', rest: '90s', cat: 'Hamstring' },
      { name: 'Lunges', sets: 3, reps: '10/leg', rest: '60s', cat: 'Quads' },
      { name: 'Calf Raise', sets: 3, reps: '15', rest: '45s', cat: 'Calves' },
    ],
    cardio: [
      { name: 'Jogging', sets: 1, reps: '25 menit', rest: '-', cat: 'Cardio' },
      { name: 'Cycling', sets: 1, reps: '20 menit', rest: '-', cat: 'Cardio' },
    ],
    core: [
      { name: 'Plank', sets: 3, reps: '45 detik', rest: '30s', cat: 'Core' },
      { name: 'Bicycle Crunch', sets: 3, reps: '20', rest: '30s', cat: 'Core' },
    ],
  },
  toning: {
    upper: [
      { name: 'Resistance Band Row', sets: 3, reps: '15', rest: '45s', cat: 'Back' },
      { name: 'Dumbbell Fly', sets: 3, reps: '15', rest: '45s', cat: 'Chest' },
      { name: 'Lateral Raise', sets: 4, reps: '15', rest: '30s', cat: 'Shoulder' },
      { name: 'Tricep Kickback', sets: 3, reps: '15', rest: '30s', cat: 'Triceps' },
      { name: 'Concentration Curl', sets: 3, reps: '15', rest: '30s', cat: 'Biceps' },
    ],
    lower: [
      { name: 'Sumo Squat', sets: 4, reps: '15', rest: '45s', cat: 'Quads/Glutes' },
      { name: 'Hip Thrust', sets: 4, reps: '15', rest: '45s', cat: 'Glutes' },
      { name: 'Side Lunge', sets: 3, reps: '12/leg', rest: '45s', cat: 'Quads/Adductor' },
      { name: 'Donkey Kick', sets: 3, reps: '20/leg', rest: '30s', cat: 'Glutes' },
      { name: 'Calf Raise', sets: 4, reps: '20', rest: '30s', cat: 'Calves' },
    ],
    cardio: [
      { name: 'Treadmill Incline Walk', sets: 1, reps: '35 menit', rest: '-', cat: 'Cardio' },
      { name: 'Aerobik / Zumba', sets: 1, reps: '30 menit', rest: '-', cat: 'Cardio' },
      { name: 'Jump Rope', sets: 4, reps: '3 menit', rest: '60s', cat: 'Cardio' },
    ],
    core: [
      { name: 'Plank', sets: 3, reps: '60 detik', rest: '30s', cat: 'Core' },
      { name: 'Side Plank', sets: 3, reps: '30 detik/sisi', rest: '30s', cat: 'Core' },
      { name: 'Crunches', sets: 3, reps: '20', rest: '30s', cat: 'Core' },
      { name: 'Glute Bridge', sets: 3, reps: '20', rest: '30s', cat: 'Glutes/Core' },
    ],
  },
}

// Returns weekly schedule as array of 7 days
export function generateWeeklyWorkout({ goal = 'cut', bodyFat, muscleMass, bmi, gender }) {
  const db = exerciseDB[goal] || exerciseDB.maintain

  // Determine intensity modifier
  let intensity = 'normal'
  if (bodyFat > 30 || bmi > 30) intensity = 'beginner'
  else if (bodyFat < 15 && muscleMass > 40) intensity = 'advanced'

  // Weekly template by goal
  const templates = {
    cut: [
      { day: 'Senin', focus: 'Upper Body + Cardio', groups: ['upper', 'cardio'], picks: [5, 2] },
      { day: 'Selasa', focus: 'Lower Body + Core', groups: ['lower', 'core'], picks: [5, 3] },
      { day: 'Rabu', focus: 'Cardio HIIT + Core', groups: ['cardio', 'core'], picks: [2, 3] },
      { day: 'Kamis', focus: 'Upper Body', groups: ['upper'], picks: [6] },
      { day: "Jum'at", focus: 'Lower Body + Cardio', groups: ['lower', 'cardio'], picks: [4, 2] },
      { day: 'Sabtu', focus: 'Full Body + Cardio Ringan', groups: ['upper', 'lower', 'cardio'], picks: [3, 3, 1] },
      { day: 'Minggu', focus: 'Rest / Aktif Recovery', groups: [], picks: [], rest: true },
    ],
    bulk: [
      { day: 'Senin', focus: 'Chest + Triceps', groups: ['upper'], picks: [4] },
      { day: 'Selasa', focus: 'Back + Biceps', groups: ['upper'], picks: [4] },
      { day: 'Rabu', focus: 'Legs', groups: ['lower'], picks: [5] },
      { day: 'Kamis', focus: 'Shoulder + Core', groups: ['upper', 'core'], picks: [3, 2] },
      { day: "Jum'at", focus: 'Full Body Compound', groups: ['upper', 'lower'], picks: [3, 3] },
      { day: 'Sabtu', focus: 'Cardio Ringan + Stretching', groups: ['cardio'], picks: [1] },
      { day: 'Minggu', focus: 'Rest', groups: [], picks: [], rest: true },
    ],
    maintain: [
      { day: 'Senin', focus: 'Upper Body', groups: ['upper'], picks: [5] },
      { day: 'Selasa', focus: 'Cardio + Core', groups: ['cardio', 'core'], picks: [2, 2] },
      { day: 'Rabu', focus: 'Lower Body', groups: ['lower'], picks: [4] },
      { day: 'Kamis', focus: 'Rest / Stretching', groups: [], picks: [], rest: true },
      { day: "Jum'at", focus: 'Full Body', groups: ['upper', 'lower'], picks: [3, 3] },
      { day: 'Sabtu', focus: 'Cardio + Core', groups: ['cardio', 'core'], picks: [2, 2] },
      { day: 'Minggu', focus: 'Rest', groups: [], picks: [], rest: true },
    ],
    toning: [
      { day: 'Senin', focus: 'Upper Body + Cardio', groups: ['upper', 'cardio'], picks: [4, 1] },
      { day: 'Selasa', focus: 'Lower Body + Core', groups: ['lower', 'core'], picks: [4, 3] },
      { day: 'Rabu', focus: 'Cardio + Core', groups: ['cardio', 'core'], picks: [2, 2] },
      { day: 'Kamis', focus: 'Upper Body', groups: ['upper', 'core'], picks: [4, 2] },
      { day: "Jum'at", focus: 'Lower Body + Cardio', groups: ['lower', 'cardio'], picks: [4, 2] },
      { day: 'Sabtu', focus: 'Full Body Circuit', groups: ['upper', 'lower', 'core'], picks: [2, 2, 2] },
      { day: 'Minggu', focus: 'Rest / Yoga', groups: [], picks: [], rest: true },
    ],
  }

  const template = templates[goal] || templates.maintain

  function pick(arr, n) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(n, shuffled.length))
  }

  return template.map(dayPlan => {
    if (dayPlan.rest) return { ...dayPlan, exercises: [] }
    const exercises = []
    dayPlan.groups.forEach((group, idx) => {
      const pool = db[group] || []
      const n = dayPlan.picks[idx] || 3
      pick(pool, n).forEach(ex => {
        let modEx = { ...ex }
        if (intensity === 'beginner') {
          modEx.sets = Math.max(2, ex.sets - 1)
          modEx.note = 'Mulai ringan, fokus teknik'
        } else if (intensity === 'advanced') {
          modEx.sets = ex.sets + 1
          modEx.note = 'Tambah beban progressif'
        }
        exercises.push(modEx)
      })
    })
    return { ...dayPlan, exercises, intensity }
  })
}
