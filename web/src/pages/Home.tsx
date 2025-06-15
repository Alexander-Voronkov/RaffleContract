import SlotCasino from "../components/Slot";

const Home = () => {
  return (
    <div className="flex w-full h-full items-center justify-center gap-8">
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjDmo8Gpgn2Wr3p33euSswV0t0hr4pIaeeMQ&s" alt="Left"/>
      <div className="w-64">
        <SlotCasino/>
      </div>
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjDmo8Gpgn2Wr3p33euSswV0t0hr4pIaeeMQ&s" alt="Right" />
  </div>
  );
};

export default Home;