import SlotCasino from "../components/Slot";
import WinnerHistory from "../components/WinnerHistory";

const Home = () => {
  return (
    <div className="flex w-full h-full items-center justify-around gap-50">
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjDmo8Gpgn2Wr3p33euSswV0t0hr4pIaeeMQ&s" alt="Left"/>
      <WinnerHistory></WinnerHistory>
      <SlotCasino/>
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjDmo8Gpgn2Wr3p33euSswV0t0hr4pIaeeMQ&s" alt="Right" />
  </div>
  );
};

export default Home;