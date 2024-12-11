// "use client";

// import React, { useEffect, useState } from "react";
// import { db, storage } from "@/firebase/firebase"; // Pastikan storage diimpor
// import { collection, getDocs, query, where, addDoc, updateDoc, doc } from "firebase/firestore";
// import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// import NavbarProduksi from "@/components/NavbarProduksi";

// const Services = () => {
//   const [transactions, setTransactions] = useState([]);
//   const [progressData, setProgressData] = useState({});
//   const [uploadImage, setUploadImage] = useState({});

//   // Fetch transaksi dengan status "disetujui"
//   useEffect(() => {
//     const fetchApprovedTransactions = async () => {
//       try {
//         const approvedQuery = query(
//           collection(db, "cart"),
//           where("status", "==", "disetujui")
//         );
//         const querySnapshot = await getDocs(approvedQuery);
//         const data = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setTransactions(data);
//       } catch (error) {
//         console.error("Error fetching approved transactions:", error);
//       }
//     };

//     fetchApprovedTransactions();
//   }, []);

//   // Fungsi upload gambar ke Firebase Storage
//   const uploadImageToStorage = async (file) => {
//     try {
//       const storageRef = ref(storage, `progress_images/${file.name}`);
//       const uploadTask = uploadBytesResumable(storageRef, file);

//       return new Promise((resolve, reject) => {
//         uploadTask.on(
//           "state_changed",
//           null,
//           (error) => reject(error),
//           async () => {
//             const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
//             resolve(downloadURL);
//           }
//         );
//       });
//     } catch (error) {
//       console.error("Error uploading image:", error);
//       throw error;
//     }
//   };

//   // Submit progress baru ke database
//   const handleSubmitProgress = async (transactionId) => {
//     try {
//       const transaction = transactions.find((t) => t.id === transactionId);
//       const currentProgress = progressData[transactionId] || "";
//       const imageFile = uploadImage[transactionId] || null;

//       let imageURL = null;
//       if (imageFile) {
//         imageURL = await uploadImageToStorage(imageFile);
//       }

//       const progressStage = transaction.progress ? transaction.progress.length + 1 : 1;
//       const progressName = `progress ${progressStage}`;

//       const newProgressData = {
//         progress: progressName,
//         keterangan: currentProgress,
//         image: imageURL,
//         statusProgres: progressStage === 1 ? "terkirim" : `progress ${progressStage}`,
//         timestamp: new Date(),
//       };

//       await addDoc(collection(db, "progress"), { ...newProgressData, transactionId });

//       setTransactions((prevTransactions) =>
//         prevTransactions.map((t) =>
//           t.id === transactionId
//             ? {
//                 ...t,
//                 progress: [...(t.progress || []), newProgressData],
//               }
//             : t
//         )
//       );
//       alert("Progress berhasil dikirim!");
//     } catch (error) {
//       console.error("Error submitting progress:", error);
//     }
//   };

//   // Fungsi untuk menandai pemasangan selesai
//   const handleCompleteInstallation = async (transactionId) => {
//     try {
//       await updateDoc(doc(db, "progress", transactionId), {
//         statusProgres: "pemasangan selesai",
//       });

//       setTransactions((prevTransactions) =>
//         prevTransactions.map((t) =>
//           t.id === transactionId
//             ? {
//                 ...t,
//                 statusProgres: "pemasangan selesai",
//               }
//             : t
//         )
//       );
//       alert("Pemasangan selesai berhasil ditandai!");
//     } catch (error) {
//       console.error("Error marking installation complete:", error);
//     }
//   };

//   return (
//     <div className="mt-32">
//       <NavbarProduksi />
//       <div className="transaction-history">
//         <h1 className="text-2xl font-bold mb-4">Riwayat Transaksi</h1>
//         {transactions.length === 0 ? (
//           <p>Belum ada transaksi.</p>
//         ) : (
//           transactions.map((transaction) => (
//             <div key={transaction.id} className="mb-6 border p-4 rounded">
//               <h2 className="text-xl font-semibold mb-2">Order ID: {transaction.id}</h2>
//               <p><strong>User Name:</strong> {transaction.userName || "Tidak Diketahui"}</p>
//               <p><strong>Tanggal:</strong> {new Date(transaction.timeStamp?.toDate()).toLocaleString()}</p>
//               <h3 className="text-lg font-medium mt-4">Pesanan:</h3>
//               {/* Form untuk upload progress */}
//               <div className="mt-4">
//                 <input
//                   type="file"
//                   onChange={(e) =>
//                     setUploadImage({
//                       ...uploadImage,
//                       [transaction.id]: e.target.files[0],
//                     })
//                   }
//                 />
//                 <textarea
//                   placeholder="Masukkan keterangan progress"
//                   value={progressData[transaction.id] || ""}
//                   onChange={(e) =>
//                     setProgressData({
//                       ...progressData,
//                       [transaction.id]: e.target.value,
//                     })
//                   }
//                   className="w-full border p-2 mt-2"
//                 ></textarea>
//                 <button
//                   className="bg-green-500 text-white px-3 py-1 mt-2 rounded"
//                   onClick={() => handleSubmitProgress(transaction.id)}
//                 >
//                   Kirim Progress
//                 </button>
//               </div>

//               {/* Tombol Pemasangan Selesai */}
//               {transaction.statusProgres !== "pemasangan selesai" && (
//                 <button
//                   className="bg-blue-500 text-white px-3 py-1 mt-4 rounded"
//                   onClick={() => handleCompleteInstallation(transaction.id)}
//                 >
//                   Tandai Pemasangan Selesai
//                 </button>
//               )}

//               {/* Riwayat progress */}
//               {transaction.progress && (
//                 <div className="mt-4">
//                   <h3 className="text-lg font-medium">Riwayat Progress:</h3>
//                   {transaction.progress.map((prog, index) => (
//                     <div key={index} className="border p-2 mt-2">
//                       <p><strong>Progress:</strong> {prog.progress}</p>
//                       <p><strong>Keterangan:</strong> {prog.keterangan}</p>
//                       {prog.image && (
//                         <img src={prog.image} alt="Uploaded" className="mt-2 max-w-full" />
//                       )}
//                       <p><strong>Status:</strong> {prog.statusProgres}</p>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default Services;



// "use client";

// import React, { useEffect, useState } from "react";
// import { db, storage } from "@/firebase/firebase"; // Pastikan storage diimpor
// import { collection, getDocs, query, where, addDoc, updateDoc, doc } from "firebase/firestore";
// import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// import NavbarProduksi from "@/components/NavbarProduksi";

// const Services = () => {
//   const [transactions, setTransactions] = useState([]);
//   const [progressData, setProgressData] = useState({});
//   const [uploadImage, setUploadImage] = useState({});

//   // Fetch transaksi dengan status "disetujui"
//   useEffect(() => {
//     const fetchApprovedTransactions = async () => {
//       try {
//         const approvedQuery = query(
//           collection(db, "cart"),
//           where("status", "==", "disetujui")
//         );
//         const querySnapshot = await getDocs(approvedQuery);
//         const data = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setTransactions(data);
//       } catch (error) {
//         console.error("Error fetching approved transactions:", error);
//       }
//     };

//     fetchApprovedTransactions();
//   }, []);

//   // Fungsi upload gambar ke Firebase Storage
//   const uploadImageToStorage = async (file) => {
//     try {
//       const storageRef = ref(storage, `progress_images/${file.name}`);
//       const uploadTask = uploadBytesResumable(storageRef, file);

//       return new Promise((resolve, reject) => {
//         uploadTask.on(
//           "state_changed",
//           null,
//           (error) => reject(error),
//           async () => {
//             const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
//             resolve(downloadURL);
//           }
//         );
//       });
//     } catch (error) {
//       console.error("Error uploading image:", error);
//       throw error;
//     }
//   };

//   // Submit progress baru ke database
//   const handleSubmitProgress = async (transactionId) => {
//     try {
//       const transaction = transactions.find((t) => t.id === transactionId);
//       const currentProgress = progressData[transactionId] || "";
//       const imageFile = uploadImage[transactionId] || null;

//       let imageURL = null;
//       if (imageFile) {
//         imageURL = await uploadImageToStorage(imageFile);
//       }

//       const progressStage = transaction.progress ? transaction.progress.length + 1 : 1;
//       const progressName = `progress ${progressStage}`;

//       const newProgressData = {
//         progress: progressName,
//         keterangan: currentProgress,
//         image: imageURL,
//         statusProgres: progressStage === 1 ? "terkirim" : `progress ${progressStage}`,
//         timestamp: new Date(),
//       };

//       await addDoc(collection(db, "progress"), { ...newProgressData, transactionId });

//       setTransactions((prevTransactions) =>
//         prevTransactions.map((t) =>
//           t.id === transactionId
//             ? {
//                 ...t,
//                 progress: [...(t.progress || []), newProgressData],
//               }
//             : t
//         )
//       );
//       alert("Progress berhasil dikirim!");
//     } catch (error) {
//       console.error("Error submitting progress:", error);
//     }
//   };

//   // Fungsi untuk menandai pemasangan selesai
//   const handleCompleteInstallation = async (transactionId) => {
//     try {
//       // Cari dokumen progress berdasarkan transactionId
//       const progressQuery = query(
//         collection(db, "progress"),
//         where("transactionId", "==", transactionId)
//       );
//       const querySnapshot = await getDocs(progressQuery);

//       // Lakukan pembaruan untuk semua dokumen terkait transaksi ini
//       querySnapshot.forEach(async (docSnapshot) => {
//         const progressRef = doc(db, "progress", docSnapshot.id);
//         await updateDoc(progressRef, {
//           statusProgres: "pemasangan selesai",
//         });
//       });

//       // Perbarui status pada state transaksi di frontend
//       setTransactions((prevTransactions) =>
//         prevTransactions.map((t) =>
//           t.id === transactionId
//             ? {
//                 ...t,
//                 statusProgres: "pemasangan selesai",
//               }
//             : t
//         )
//       );

//       alert("Pemasangan selesai berhasil ditandai!");
//     } catch (error) {
//       console.error("Error marking installation complete:", error);
//     }
//   };

//   return (
//     <div className="mt-32">
//       <NavbarProduksi />
//       <div className="transaction-history">
//         <h1 className="text-2xl font-bold mb-4">Riwayat Transaksi</h1>
//         {transactions.length === 0 ? (
//           <p>Belum ada transaksi.</p>
//         ) : (
//           transactions.map((transaction) => (
//             <div key={transaction.id} className="mb-6 border p-4 rounded">
//               <h2 className="text-xl font-semibold mb-2">Order ID: {transaction.id}</h2>
//               <p><strong>User Name:</strong> {transaction.userName || "Tidak Diketahui"}</p>
//               <p><strong>Tanggal:</strong> {new Date(transaction.timeStamp?.toDate()).toLocaleString()}</p>
//               <h3 className="text-lg font-medium mt-4">Pesanan:</h3>
//               {/* Form untuk upload progress */}
//               <div className="mt-4">
//                 <input
//                   type="file"
//                   onChange={(e) =>
//                     setUploadImage({
//                       ...uploadImage,
//                       [transaction.id]: e.target.files[0],
//                     })
//                   }
//                 />
//                 <textarea
//                   placeholder="Masukkan keterangan progress"
//                   value={progressData[transaction.id] || ""}
//                   onChange={(e) =>
//                     setProgressData({
//                       ...progressData,
//                       [transaction.id]: e.target.value,
//                     })
//                   }
//                   className="w-full border p-2 mt-2"
//                 ></textarea>
//                 <button
//                   className="bg-green-500 text-white px-3 py-1 mt-2 rounded"
//                   onClick={() => handleSubmitProgress(transaction.id)}
//                 >
//                   Kirim Progress
//                 </button>
//               </div>

//               {/* Tombol Pemasangan Selesai */}
//               {transaction.statusProgres !== "pemasangan selesai" && (
//                 <button
//                   className="bg-blue-500 text-white px-3 py-1 mt-4 rounded"
//                   onClick={() => handleCompleteInstallation(transaction.id)}
//                 >
//                   Tandai Pemasangan Selesai
//                 </button>
//               )}

//               {/* Riwayat progress */}
//               {transaction.progress && (
//                 <div className="mt-4">
//                   <h3 className="text-lg font-medium">Riwayat Progress:</h3>
//                   {transaction.progress.map((prog, index) => (
//                     <div key={index} className="border p-2 mt-2">
//                       <p><strong>Progress:</strong> {prog.progress}</p>
//                       <p><strong>Keterangan:</strong> {prog.keterangan}</p>
//                       {prog.image && (
//                         <img src={prog.image} alt="Uploaded" className="mt-2 max-w-full" />
//                       )}
//                       <p><strong>Status:</strong> {prog.statusProgres}</p>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default Services;



"use client";

import React, { useEffect, useState } from "react";
import { db, storage } from "@/firebase/firebase"; // Pastikan storage diimpor
import { collection, getDocs, query, where, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import NavbarProduksi from "@/components/NavbarProduksi";

const Services = () => {
  const [transactions, setTransactions] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [uploadImage, setUploadImage] = useState({});

  // Fetch transaksi dengan status "disetujui"
  useEffect(() => {
    const fetchApprovedTransactions = async () => {
      try {
        const approvedQuery = query(
          collection(db, "cart"),
          where("status", "==", "disetujui")
        );
        const querySnapshot = await getDocs(approvedQuery);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransactions(data);

        // Fetch progress yang terkait dengan transaksi yang diambil
        const progressQuery = query(
          collection(db, "progress"),
          where("transactionId", "in", data.map((t) => t.id))
        );
        const progressSnapshot = await getDocs(progressQuery);
        const progress = progressSnapshot.docs.reduce((acc, doc) => {
          const data = doc.data();
          const transactionId = data.transactionId;
          if (!acc[transactionId]) {
            acc[transactionId] = [];
          }
          acc[transactionId].push(data);
          return acc;
        }, {});
        setProgressData(progress);
      } catch (error) {
        console.error("Error fetching approved transactions:", error);
      }
    };

    fetchApprovedTransactions();
  }, []);

  // Fungsi upload gambar ke Firebase Storage
  const uploadImageToStorage = async (file) => {
    try {
      const storageRef = ref(storage, `progress_images/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          null,
          (error) => reject(error),
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  // Submit progress baru ke database
  const handleSubmitProgress = async (transactionId) => {
    try {
      const transaction = transactions.find((t) => t.id === transactionId);
      const currentProgress = progressData[transactionId] || "";
      const imageFile = uploadImage[transactionId] || null;

      let imageURL = null;
      if (imageFile) {
        imageURL = await uploadImageToStorage(imageFile);
      }

      const progressStage = transaction.progress ? transaction.progress.length + 1 : 1;
      const progressName = `progress ${progressStage}`;

      const newProgressData = {
        progress: progressName,
        keterangan: currentProgress,
        image: imageURL,
        statusProgres: progressStage === 1 ? "terkirim" : `progress ${progressStage}`,
        timestamp: new Date(),
        transactionId,
      };

      await addDoc(collection(db, "progress"), newProgressData);

      // Update progress pada transaksi
      setProgressData((prevData) => ({
        ...prevData,
        [transactionId]: [...(prevData[transactionId] || []), newProgressData],
      }));

      alert("Progress berhasil dikirim!");
    } catch (error) {
      console.error("Error submitting progress:", error);
    }
  };

  // Fungsi untuk menandai pemasangan selesai
  const handleCompleteInstallation = async (transactionId) => {
    try {
      // Cari dokumen progress berdasarkan transactionId
      const progressQuery = query(
        collection(db, "progress"),
        where("transactionId", "==", transactionId)
      );
      const querySnapshot = await getDocs(progressQuery);

      // Lakukan pembaruan untuk semua dokumen terkait transaksi ini
      querySnapshot.forEach(async (docSnapshot) => {
        const progressRef = doc(db, "progress", docSnapshot.id);
        await updateDoc(progressRef, {
          statusProgres: "pemasangan selesai",
        });
      });

      // Perbarui status pada state transaksi di frontend
      setTransactions((prevTransactions) =>
        prevTransactions.map((t) =>
          t.id === transactionId
            ? {
                ...t,
                statusProgres: "pemasangan selesai",
              }
            : t
        )
      );

      alert("Pemasangan selesai berhasil ditandai!");
    } catch (error) {
      console.error("Error marking installation complete:", error);
    }
  };

  return (
    <div className="mt-32">
      <NavbarProduksi />
      <div className="transaction-history">
        <h1 className="text-2xl font-bold mb-4">Riwayat Transaksi</h1>
        {transactions.length === 0 ? (
          <p>Belum ada transaksi.</p>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="mb-6 border p-4 rounded">
              <h2 className="text-xl font-semibold mb-2">Order ID: {transaction.id}</h2>
              <p><strong>User Name:</strong> {transaction.userName || "Tidak Diketahui"}</p>
              <p><strong>Tanggal:</strong> {new Date(transaction.timeStamp?.toDate()).toLocaleString()}</p>
              <h3 className="text-lg font-medium mt-4">Pesanan:</h3>
              {/* Form untuk upload progress */}
              <div className="mt-4">
                <input
                  type="file"
                  onChange={(e) =>
                    setUploadImage({
                      ...uploadImage,
                      [transaction.id]: e.target.files[0],
                    })
                  }
                />
                <textarea
                  placeholder="Masukkan keterangan progress"
                  value={progressData[transaction.id] || ""}
                  onChange={(e) =>
                    setProgressData({
                      ...progressData,
                      [transaction.id]: e.target.value,
                    })
                  }
                  className="w-full border p-2 mt-2"
                ></textarea>
                <button
                  className="bg-green-500 text-white px-3 py-1 mt-2 rounded"
                  onClick={() => handleSubmitProgress(transaction.id)}
                >
                  Kirim Progress
                </button>
              </div>

              {/* Tombol Pemasangan Selesai */}
              {transaction.statusProgres !== "pemasangan selesai" && (
                <button
                  className="bg-blue-500 text-white px-3 py-1 mt-4 rounded"
                  onClick={() => handleCompleteInstallation(transaction.id)}
                >
                  Tandai Pemasangan Selesai
                </button>
              )}

              {/* Riwayat progress */}
              {progressData[transaction.id] && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium">Riwayat Progress:</h3>
                  {progressData[transaction.id].map((prog, index) => (
                    <div key={index} className="border p-2 mt-2">
                      <p><strong>Progress:</strong> {prog.progress}</p>
                      <p><strong>Keterangan:</strong> {prog.keterangan}</p>
                      {prog.image && (
                        <img src={prog.image} alt="Uploaded" className="mt-2 max-w-full" />
                      )}
                      <p><strong>Status:</strong> {prog.statusProgres}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Services;
