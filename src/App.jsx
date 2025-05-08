import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Leaderboard from "./pages/page-3/Leaderboard";
import NotFound from "./pages/NotFound";

function App() {
  return (
<div class="relative w-full min-h-screen bg-gradient-to-b from-black via-pink-950 to-black overflow-hidden">

  <div class="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-pink-500 opacity-20 blur-3xl"></div>
  <div class="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-pink-500 opacity-25 blur-3xl"></div>
  <div class="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-pink-500 opacity-20 blur-3xl"></div>
  
  
  <div class="absolute top-1/2 -right-10 w-40 h-40 rounded-full bg-fuchsia-600 opacity-10 blur-2xl"></div>

  <div class="absolute bottom-1/3 -left-10 w-40 h-40 rounded-full bg-fuchsia-600 opacity-10 blur-2xl"></div>
  

  <div class="absolute inset-0">

  <div class="absolute h-1 w-1 rounded-full bg-pink-200 opacity-40 top-1/4 right-1/3"></div>
  <div class="absolute h-[3px] w-[3px] rounded-full bg-pink-100 opacity-50 top-1/2 right-1/4"></div>
  <div class="absolute h-1 w-1 rounded-full bg-pink-200 opacity-40 bottom-1/4 left-1/3"></div>
  <div class="absolute h-[2px] w-[2px] rounded-full bg-pink-100 opacity-50 bottom-1/3 left-1/4"></div>
  <div class="absolute h-[2px] w-[2px] rounded-full bg-pink-200 opacity-40 bottom-1/5 right-1/5"></div>
  

  <div class="absolute h-[1px] w-[1px] rounded-full bg-pink-100 opacity-40 top-1/6 right-1/6"></div>
  <div class="absolute h-[2px] w-[2px] rounded-full bg-pink-200 opacity-30 top-1/3 right-1/2"></div>
  <div class="absolute h-[1px] w-[1px] rounded-full bg-pink-100 opacity-40 top-2/5 right-2/3"></div>
  <div class="absolute h-[3px] w-[3px] rounded-full bg-pink-100 opacity-50 top-3/5 right-1/5"></div>
  <div class="absolute h-[2px] w-[2px] rounded-full bg-pink-200 opacity-40 top-3/4 right-2/5"></div>
  <div class="absolute h-[1px] w-[1px] rounded-full bg-pink-100 opacity-40 top-4/5 right-3/5"></div>
  
  <div class="absolute h-[1px] w-[1px] rounded-full bg-pink-100 opacity-40 top-1/6 left-1/6"></div>
  <div class="absolute h-[2px] w-[2px] rounded-full bg-pink-200 opacity-30 top-1/3 left-1/2"></div>
  <div class="absolute h-[1px] w-[1px] rounded-full bg-pink-100 opacity-40 top-2/5 left-2/3"></div>
  <div class="absolute h-[3px] w-[3px] rounded-full bg-pink-100 opacity-50 top-3/5 left-1/5"></div>
  <div class="absolute h-[2px] w-[2px] rounded-full bg-pink-200 opacity-40 top-3/4 left-2/5"></div>
  <div class="absolute h-[1px] w-[1px] rounded-full bg-pink-100 opacity-40 top-4/5 left-3/5"></div>
  
  <div class="absolute h-[1px] w-[1px] rounded-full bg-fuchsia-100 opacity-30 bottom-1/6 right-1/6"></div>
  <div class="absolute h-[2px] w-[2px] rounded-full bg-pink-200 opacity-40 bottom-1/7 right-2/5"></div>
  <div class="absolute h-[3px] w-[3px] rounded-full bg-pink-100 opacity-50 bottom-2/7 right-1/7"></div>
  <div class="absolute h-[1px] w-[1px] rounded-full bg-fuchsia-100 opacity-30 bottom-3/7 right-3/5"></div>
  <div class="absolute h-[2px] w-[2px] rounded-full bg-pink-200 opacity-30 bottom-3/5 right-3/4"></div>
  
  <div class="absolute h-[1px] w-[1px] rounded-full bg-fuchsia-100 opacity-30 bottom-1/6 left-1/6"></div>
  <div class="absolute h-[2px] w-[2px] rounded-full bg-pink-200 opacity-40 bottom-1/7 left-2/5"></div>
  <div class="absolute h-[3px] w-[3px] rounded-full bg-pink-100 opacity-50 bottom-2/7 left-1/7"></div>
  <div class="absolute h-[1px] w-[1px] rounded-full bg-fuchsia-100 opacity-30 bottom-3/7 left-3/5"></div>
  <div class="absolute h-[2px] w-[2px] rounded-full bg-pink-200 opacity-30 bottom-3/5 left-3/4"></div>
  
 
  <div class="absolute h-[1px] w-[1px] rounded-full bg-pink-100 opacity-40 top-[45%] left-[48%]"></div>
  <div class="absolute h-[2px] w-[2px] rounded-full bg-pink-200 opacity-50 top-[47%] left-[52%]"></div>
  <div class="absolute h-[1px] w-[1px] rounded-full bg-pink-100 opacity-30 top-[49%] left-[49%]"></div>
  <div class="absolute h-[3px] w-[3px] rounded-full bg-pink-100 opacity-60 top-[51%] left-[53%]"></div>
  <div class="absolute h-[1px] w-[1px] rounded-full bg-pink-100 opacity-40 top-[53%] left-[47%]"></div>
  

  <div class="absolute h-1 w-1 rounded-full bg-pink-100 opacity-70 top-1/3 left-2/3"></div>
  <div class="absolute h-1 w-1 rounded-full bg-pink-100 opacity-70 top-2/3 right-2/3"></div>
  <div class="absolute h-[4px] w-[4px] rounded-full bg-pink-100 opacity-60 bottom-1/4 right-1/4"></div>
</div>

  <div class="relative z-10">
    <Router>
      <Routes>
        <Route path="/" element={<Leaderboard c="0" />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
    </div>
    </div>
  );
}

export default App;
