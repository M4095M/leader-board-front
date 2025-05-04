// src/pages/Welcome.jsx (or wherever it is)
import NavBar from "../../Navbar"; // Adjust path if needed
import AnimatedText from "../../AnimatedText"; // Adjust path if needed

function Welcome() {
  return (
    <>
      {/* Ensure bg-custom-background is defined and working */}
      <div className="w-full min-h-screen   p-0 m-0 bg-no-repeat">
        <NavBar />
        <AnimatedText />
      </div>
    </>
  );
}
export default Welcome;