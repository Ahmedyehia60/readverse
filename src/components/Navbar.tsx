const Navbar = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-200">
      <h1 className="text-6xl font-bold aref-ruqaa-regular"> نُسُك</h1>
      <ul className="flex items-center gap-4 ">
        <li className="p-4 ">حج</li>
        <li className="p-4">عمره</li>
      </ul>
    </div>
  );
};

export default Navbar;
