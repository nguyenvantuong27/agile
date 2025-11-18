// import React, { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
// import {
//   useGetTattoosQuery,
//   useCreateTattooMutation,
//   useUpdateTattooMutation,
//   useDeleteTattooMutation,
// } from '~/services/tattoos/tattoos.services';
// import { useGetAllUsersQuery } from '~/services/users/user.services';
// import { useGetAppointmentCategoriesQuery } from '~/services/appointment_categories/appointment_categories.services';
// import { Button } from 'react-daisyui';
// import { ITattoo } from '~/domain/types/tattoo/tattoo.model';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const TattooManagement: React.FC = () => {
//   const { data: tattoosData, isLoading, refetch } = useGetTattoosQuery();
//   const { data: usersData } = useGetAllUsersQuery();
//   const { data: categoriesData } = useGetAppointmentCategoriesQuery();
//   const [createTattoo] = useCreateTattooMutation();
//   const [updateTattoo] = useUpdateTattooMutation();
//   const [deleteTattoo] = useDeleteTattooMutation();

//   const [selectedTattoo, setSelectedTattoo] = useState<ITattoo | null>(null);
//   const [showModal, setShowModal] = useState(false);

//   const { register, handleSubmit, reset, setValue } = useForm<ITattoo>();

//   const handleEditTattoo = (tattoo: ITattoo) => {
//     setSelectedTattoo(tattoo);
//     setValue('title', tattoo.title);
//     setValue('price', tattoo.price);
//     setValue('image', tattoo.image || '');
//     setValue(
//       'artist_id',
//       typeof tattoo.artist_id === 'object' && tattoo.artist_id?._id
//         ? tattoo.artist_id._id
//         : '',
//     );
//     setValue(
//       'category_appointment',
//       typeof tattoo.category_appointment === 'object' &&
//         tattoo.category_appointment?._id
//         ? tattoo.category_appointment._id
//         : '',
//     );
//     setValue('description', tattoo.description || '');
//     setValue('suggested_positions', tattoo.suggested_positions || []);
//     setShowModal(true);
//   };

//   const handleDeleteTattoo = async (id: string) => {
//     try {
//       await deleteTattoo(id).unwrap();
//       toast.success('Xóa đồ uống thành công!');
//       refetch();
//     } catch (error) {
//       console.error('Failed to delete tattoo:', error);
//       toast.error('Xóa đồ uống thất bại!');
//     }
//   };

//   const onSubmit = async (data: ITattoo) => {
//     const suggestedPositions = data.suggested_positions
//       ? typeof data.suggested_positions === 'string'
//         ? (data.suggested_positions as string)
//             .split('\n')
//             .filter((pos) => pos.trim() !== '')
//         : data.suggested_positions
//       : [];

//     const tattooData = {
//       ...data,
//       suggested_positions: suggestedPositions,
//       category_appointment:
//         data.category_appointment === '' ||
//         data.category_appointment === undefined
//           ? ''
//           : data.category_appointment,
//     };

//     try {
//       if (selectedTattoo) {
//         await updateTattoo({
//           id: selectedTattoo._id,
//           data: tattooData,
//         }).unwrap();
//         toast.success('Cập nhật đồ uống thành công!');
//       } else {
//         await createTattoo(tattooData).unwrap();
//         toast.success('Thêm đồ uống thành công!');
//       }
//       reset();
//       setShowModal(false);
//       refetch();
//     } catch (error) {
//       console.error('Failed to save :', error);
//       toast.error(
//         selectedTattoo
//           ? 'Cập nhật đồ uống thất bại!'
//           : 'Thêm đồ uống thất bại!',
//       );
//     }
//   };

//   return (
//     <div className="p-6 relative">
//       <h1 className="text-2xl font-bold mb-4">Quản lý Đồ Uống</h1>
//       <Button
//         color="primary"
//         onClick={() => {
//           setSelectedTattoo(null);
//           reset();
//           setShowModal(true);
//         }}
//       >
//         <FaPlus /> Thêm Đồ Uống
//       </Button>

//       <table className="table table-zebra w-full mt-4">
//         <thead>
//           <tr>
//             <th>ID</th>
//             <th>Tiêu đề</th>
//             <th>Giá</th>
//             <th>Nhân viên phục vụ</th>
//             <th>Danh mục</th>
//             <th>Ảnh</th>
//             <th>Hành động</th>
//           </tr>
//         </thead>
//         <tbody>
//           {!isLoading &&
//             tattoosData?.data?.map((tattoo) => (
//               <tr key={tattoo._id}>
//                 <td>{tattoo._id}</td>
//                 <td>{tattoo.title}</td>
//                 <td>{tattoo.price.toLocaleString()} VND</td>
//                 <td>
//                   {typeof tattoo.artist_id === 'object' && tattoo.artist_id
//                     ? tattoo.artist_id.full_name
//                     : 'Không rõ'}
//                 </td>
//                 <td>
//                   {typeof tattoo.category_appointment === 'object' &&
//                   tattoo.category_appointment
//                     ? tattoo.category_appointment.name
//                     : 'Không có'}
//                 </td>
//                 <td>
//                   <img
//                     src={tattoo.image}
//                     alt={tattoo.title}
//                     className="w-16 h-16 object-cover"
//                   />
//                 </td>
//                 <td className="flex items-center gap-2">
//                   <Button
//                     color="success"
//                     className="text-white"
//                     onClick={() => handleEditTattoo(tattoo)}
//                   >
//                     <FaEdit /> Sửa
//                   </Button>
//                   <Button
//                     onClick={() => handleDeleteTattoo(tattoo._id)}
//                     color="error"
//                     className="text-white hidden"
//                   >
//                     <FaTrash /> Xóa
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//         </tbody>
//       </table>

//       {showModal && (
//         <dialog className="modal modal-open">
//           <div className="modal-box">
//             <h3 className="text-lg font-bold">
//               {selectedTattoo ? 'Chỉnh sửa Đồ Uống' : 'Thêm Đồ Uống'}
//             </h3>
//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//               <div>
//                 <label className="label">Tiêu đề</label>
//                 <input
//                   {...register('title', { required: 'Vui lòng nhập tiêu đề' })}
//                   type="text"
//                   placeholder="Tiêu đề"
//                   className="input input-bordered w-full"
//                 />
//               </div>
//               <div>
//                 <label className="label">Giá (VND)</label>
//                 <input
//                   {...register('price', {
//                     required: 'Vui lòng nhập giá',
//                     valueAsNumber: true,
//                   })}
//                   type="number"
//                   placeholder="Giá"
//                   className="input input-bordered w-full"
//                 />
//               </div>
//               <div>
//                 <label className="label">Link ảnh</label>
//                 <input
//                   {...register('image')}
//                   type="text"
//                   placeholder="Link ảnh"
//                   className="input input-bordered w-full"
//                 />
//               </div>
//               <div>
//                 <label className="label">Mô tả</label>
//                 <textarea
//                   {...register('description')}
//                   placeholder="Mô tả đồ uống"
//                   className="textarea textarea-bordered w-full"
//                 />
//               </div>
//               <div>
//                 <label className="label">
//                   Thành phần chính (mỗi dòng một thành phần)
//                 </label>
//                 <textarea
//                   {...register('suggested_positions')}
//                   placeholder="Ví dụ:\nEspresso\nSữa tươi\nSirup vanilla"
//                   className="textarea textarea-bordered w-full"
//                 />
//               </div>
//               <div>
//                 <label className="label">Nhân viên phục vụ</label>
//                 <select
//                   {...register('artist_id', {
//                     required: 'Vui lòng chọn Nhân viên phục vụ',
//                   })}
//                   className="select select-bordered w-full"
//                 >
//                   <option value="">Chọn Nhân viên phục vụ</option>
//                   {usersData?.data
//                     .filter((user) => user.role === 'artist')
//                     .map((user) => (
//                       <option key={user._id} value={user._id}>
//                         {user.full_name} - {user.branch_id?.name}
//                       </option>
//                     ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="label">Danh mục đồ uống</label>
//                 <select
//                   {...register('category_appointment')}
//                   className="select select-bordered w-full"
//                 >
//                   <option value="">Không chọn danh mục</option>
//                   {categoriesData?.data?.map((category) => (
//                     <option key={category._id} value={category._id}>
//                       {category.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="modal-action">
//                 <button type="submit" className="btn btn-primary">
//                   {selectedTattoo ? 'Cập nhật' : 'Thêm'}
//                 </button>
//                 <button
//                   type="button"
//                   className="btn"
//                   onClick={() => setShowModal(false)}
//                 >
//                   Hủy
//                 </button>
//               </div>
//             </form>
//           </div>
//         </dialog>
//       )}
//     </div>
//   );
// };

// export default TattooManagement;
