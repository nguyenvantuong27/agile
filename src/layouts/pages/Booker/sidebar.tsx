import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="w-64 py-10 h-screen bg-black text-white p-6 overflow-y-scroll fixed leading-10 font-semibold ">
      <ul>
        <li className="mb-2 mt-10 w-full">
          <Link
            to="/artist/schedules"
            className=" p-2 hover:bg-gray-700 flex items-center"
          >
            Ca làm
          </Link>
        </li>
        <li>
          <Link
            to="/artist/add-schedule"
            className="block p-2 hover:bg-gray-700"
          >
            Thêm ca làm
          </Link>
        </li>
        <li>
          <Link to="/artist/history" className="block p-2 hover:bg-gray-700">
            Lịch làm việc
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
