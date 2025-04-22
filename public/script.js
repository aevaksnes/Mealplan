const mealView = document.getElementById('meal-plan');
let offsetDays = 0;

import {
    auth, db, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, getDoc, setDoc, doc
  } from '../firebase-setup.js'; // eller fra window.firebaseStuff hvis du bruker inline script
  
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const userEmail = document.getElementById("user-email");
  
  loginBtn.addEventListener("click", () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  });
  
  logoutBtn.addEventListener("click", () => signOut(auth));
  
  let currentUser = null;
  
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      loginBtn.style.display = "none";
      logoutBtn.style.display = "inline";
      userEmail.textContent = `Logget inn som ${user.email}`;
      showWeekIfWide(); // last inn data
    } else {
      currentUser = null;
      loginBtn.style.display = "inline";
      logoutBtn.style.display = "none";
      userEmail.textContent = "";
      mealView.innerHTML = "<p>Logg inn for å se måltidsplaner</p>";
    }
  });
  




// Hent måltidsdata for gitt dato
async function getMealsForDate(date) {
    if (!currentUser) return {};
    const ref = doc(db, "mealplans", `${currentUser.uid}_${date}`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : {
      breakfast: '',
      lunch: '',
      snack: '',
      dinner: '',
      dessert: '',
      'late-night-snack': ''
    };
  }
  
  async function saveMealsForDate(date, meals) {
    if (!currentUser) return;
    const ref = doc(db, "mealplans", `${currentUser.uid}_${date}`);
    await setDoc(ref, meals);
  }
  

// Generer HTML for en dagsplan
async function createDayCard(date) {
    const meals = await getMealsForDate(date);
    const dateObj = new Date(date);
    const dayName = dateObj.toLocaleDateString('no-NO', { weekday: 'long' });
    const formattedDate = dateObj.toLocaleDateString('no-NO'); // gir DD.MM.ÅÅÅÅ
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);


  return `
    <div class="day-card">
        <div class="day-header">
            <h3>${capitalizedDay}  (${formattedDate})</h3>
            <div class="day-buttons">
                <button class="copy-btn" data-date="${date}" title="Kopier dagen">
                <img src="copy-svgrepo-com.svg" alt="Kopier" />
                </button>
                <button class="paste-btn" data-date="${date}" title="Lim inn til denne dagen">
                <img src="paste-svgrepo-com.svg" alt="Lim inn" />
                </button>
            </div>
        </div>


        <label>Breakfast:
            <textarea data-date="${date}" data-meal="breakfast" rows="3">${meals.breakfast}</textarea>
        </label>
        <label>Lunch:
            <textarea data-date="${date}" data-meal="lunch" rows="3">${meals.lunch}</textarea>
        </label>
        <label>Snack:
            <textarea data-date="${date}" data-meal="snack" rows="3">${meals.snack}</textarea>
        </label>
        <label>Dinner:
            <textarea data-date="${date}" data-meal="dinner" rows="3">${meals.dinner}</textarea>
        </label>
        <label>Dessert:
            <textarea data-date="${date}" data-meal="dessert" rows="3">${meals.dessert}</textarea>  
        </label>
        <label>Late-night snack: 
            <textarea data-date="${date}" data-meal="late-night-snack" rows="3">${meals["late-night-snack"]}</textarea>  
        </label>
    </div>
  `;
}

// Hvor mange dager som skal vises
function calculateVisibleDays() {
    const dayCardWidth = 280; // må matche CSS
    const margin = 20; // rom for padding/margin
    const availableWidth = window.innerWidth - margin;
    return Math.floor(availableWidth / dayCardWidth);
  }  

// Generer ukevisning hvis skjermen er bred nok
async function showWeekIfWide() {
    mealView.innerHTML = '';
  
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + offsetDays); // mandag
  
    const daysToShow = calculateVisibleDays();
  
    for (let i = 0; i < daysToShow; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dateStr = day.toISOString().split('T')[0];
      mealView.innerHTML += await createDayCard(dateStr);
    }
  }

  let copiedMeals = null;

  document.addEventListener('click', async (e) => {
    const copyBtn = e.target.closest('.copy-btn');
    const pasteBtn = e.target.closest('.paste-btn');
  
    if (copyBtn) {
      const date = copyBtn.dataset.date;
      copiedMeals = await getMealsForDate(date);
      alert("Dagens måltider kopiert!");
    }
  
    if (pasteBtn) {
      const date = pasteBtn.dataset.date;
      if (!copiedMeals) {
        alert("Ingen måltider kopiert ennå.");
        return;
      }
        
        await saveMealsForDate(date, copiedMeals);
        await showWeekIfWide();  // oppdater visningen
    }
  });
  
  
// Automatisk lagring når brukeren skriver
mealView.addEventListener('input', async (event) => {
    if (event.target.matches('textarea[data-date]')) {
      const { date, meal } = event.target.dataset;
      const meals = await getMealsForDate(date);
      meals[meal] = event.target.value;
      await saveMealsForDate(date, meals);
    }
  });
  

document.getElementById('prev-day').addEventListener('click', () => {
    offsetDays -= 1;
    showWeekIfWide();
  });
  
  document.getElementById('next-day').addEventListener('click', () => {
    offsetDays += 1;
    showWeekIfWide();
  });
  
  document.getElementById('prev-week').addEventListener('click', () => {
    offsetDays -= 7;
    showWeekIfWide();
  });
  
  document.getElementById('next-week').addEventListener('click', () => {
    offsetDays += 7;
    showWeekIfWide();
  });
  

window.addEventListener('DOMContentLoaded', showWeekIfWide);
window.addEventListener('resize', showWeekIfWide);
