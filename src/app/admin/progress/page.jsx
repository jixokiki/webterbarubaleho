"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/firebase/firebase"; // Import db only once
import { collection, getDocs } from "firebase/firestore"; // Import collection and getDocs only once
import NavbarProduksi from "@/components/NavbarProduksi";
import useAuth from "@/app/hooks/useAuth";
import CardItem from "@/components/CardItem";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { useRouter } from "next/navigation";
import NavbarAdmin from "@/components/NavbarAdmin";

const Progres = () => {
  const { user, userProfile } = useAuth();
  const router = useRouter();

  // Redirect to admin if the user is an admin
  useEffect(() => {
    if (user && userProfile.role === "user") {
      router.push("/");
    }
  }, [user, userProfile, router]);

  const [progressData, setProgressData] = useState([]);

  // Fetch all progress data
  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const progressQuery = collection(db, "progress");
        const querySnapshot = await getDocs(progressQuery);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProgressData(data);
      } catch (error) {
        console.error("Error fetching progress data:", error);
      }
    };

    fetchProgressData();
  }, []);

  return (
    <div className="mt-32">
      <NavbarAdmin />
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">Riwayat Progress</h1>
        {progressData.length === 0 ? (
          <p className="text-center text-lg text-gray-500">Belum ada progress.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {progressData.map((prog) => (
              <div key={prog.id} className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Progress ID: {prog.id}</h2>
                <p className="text-lg text-gray-700"><strong>Pengguna:</strong> {prog.userName || "Tidak Diketahui"}</p>
                <p className="text-lg text-gray-700"><strong>Keterangan:</strong> {prog.keterangan || "Tidak Diketahui"}</p>
                <p className="text-lg text-gray-700"><strong>Status:</strong> {prog.statusProgres || "Tidak Diketahui"}</p>
                
                {prog.pesanan && prog.pesanan.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-lg text-gray-800">Pesanan Images:</h3>
                    {prog.pesanan.map((imageUrl, index) => (
                      <div key={index} className="mt-2">
                        <img 
                          src={imageUrl} 
                          alt={`Pesanan Image ${index + 1}`} 
                          className="rounded-md shadow-md w-full h-auto object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <p className="mt-4 text-lg text-gray-700"><strong>Progress:</strong> {prog.progress || "Tidak Diketahui"}</p>
                <p className="text-lg text-gray-700"><strong>Status Progress:</strong> {prog.status || "Tidak Diketahui"}</p>

                {prog.image && (
                  <div className="mt-4">
                    <img 
                      src={prog.image} 
                      alt="Uploaded Image" 
                      className="rounded-md shadow-md w-full h-auto object-cover"
                    />
                  </div>
                )}

                <p className="mt-4 text-lg text-gray-500"><strong>Timestamp:</strong> {new Date(prog.timestamp?.toDate()).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Progres;