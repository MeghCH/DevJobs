"use client";

import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { useEffect, useState } from "react";
import { authApi } from "@/lib/api";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    authApi
      .me()
      .then((res) => setIsLoggedIn(!!res?.success))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <span className="text-xl font-extrabold text-indigo-600 tracking-tight">
          DevJobs
        </span>
        {isLoggedIn ? (
          <Link
            href="/profil"
            className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Profil
          </Link>
        ) : (
          <Link
            href="/connexion"
            className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Connexion
          </Link>
        )}
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center gap-6 text-center px-8 py-24">
        <span className="text-sm font-semibold tracking-widest text-indigo-500 uppercase">
          La plateforme tech française
        </span>
        <h1 className="text-4xl font-extrabold text-indigo-600 tracking-tight">
          DevJobs
        </h1>
        <div className="flex flex-col gap-1">
          <p className="text-xl font-bold text-gray-900">
            Push ta carrière !
          </p>
          <p className="text-sm text-gray-500">
            Le job tech qui te correspond{" "}
            <span className="text-indigo-600 font-semibold">vraiment.</span>
          </p>
        </div>
        <Link
          href={isLoggedIn ? "/offres" : "/connexion"}
          className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          {isLoggedIn ? "Voir les offres" : "Commencez ici"}
        </Link>
      </section>

      {/* Stats */}
      <section className="flex justify-center gap-16 py-10 border-y border-gray-100">
        <div className="text-center w-32">
          <p className="text-3xl font-extrabold text-indigo-600">+500</p>
          <p className="text-sm text-gray-500 mt-1">Offres disponibles</p>
        </div>
        <div className="text-center w-32">
          <p className="text-3xl font-extrabold text-indigo-600">+120</p>
          <p className="text-sm text-gray-500 mt-1">Entreprises tech</p>
        </div>
        <div className="text-center w-32">
          <p className="text-3xl font-extrabold text-indigo-600">100%</p>
          <p className="text-sm text-gray-500 mt-1">Gratuit</p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"></path>
            </svg>
          </div>
          <h3 className="font-bold text-gray-900">Offres agrégées</h3>
          <p className="text-sm text-gray-500">
            Des centaines d'offres tech centralisées depuis les meilleures
            sources du marché.
          </p>
        </div>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M13 9H21L11 24V15H4L13 0V9ZM11 11V7.22063L7.53238 13H13V17.3944L17.263 11H11Z"></path>
            </svg>
          </div>
          <h3 className="font-bold text-gray-900">Filtres avancés</h3>
          <p className="text-sm text-gray-500">
            Filtre par stack, salaire, remote ou type de contrat pour trouver
            exactement ce que tu cherches.
          </p>
        </div>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-4 h-4"
              id="Startup--Streamline-Sharp-Remix"
            >
              <desc>Startup Streamline Icon: https://streamlinehq.com</desc>
              <g id="startup--shop-rocket-launch-startup">
                <path
                  id="Union"
                  fill="currentColor"
                  stroke="currentColor"
                  fill-rule="evenodd"
                  d="m11.9999 20.7678 -0.8839 -0.8839 -6.99999 -7L3.23212 12l0.00006 -0.0001 -2.11606 -2.11602 -0.883881 -0.88389 0.883881 -0.88388 3 -3 0.36612 -0.36612h5.99986l3.6339 -3.63387L14.4821 0.75h8.7678v8.76777l-0.3661 0.36611L19.25 13.5176l0 5.4824v0.5178l-0.3661 0.3661 -3 3 -0.8839 0.8839 -0.8839 -0.8839 -2.1162 -2.1162 0 0.0001Zm0 -3.5356 -5.23219 -5.2321 5.11619 -5.11622 2.1339 -2.13389h-0.0001l1.5 -1.49999 5.2322 0v5.23223l-8.75 8.74997Zm-10.88378 3.884 4.5 -4.5 1.76777 1.7678 -4.5 4.5 -1.76777 -1.7678Zm7.50006 -1.5001 -2 2 1.76777 1.7678 2.00005 -2 -1.76782 -1.7678ZM0.616122 15.6162l1.999998 -2 1.76777 1.7678 -2 2 -1.767768 -1.7678ZM15.6317 6.60049l-2.0312 2.03125 1.7678 1.76776 2.0312 -2.03125 -1.7678 -1.76776Z"
                  clip-rule="evenodd"
                  stroke-width="0.5"
                ></path>
              </g>
            </svg>
          </div>
          <h3 className="font-bold text-gray-900">Postuler en un clic</h3>
          <p className="text-sm text-gray-500">
            Crée ton profil une fois et postule directement depuis la
            plateforme.
          </p>
        </div>
      </section>
    </div>
  );
}
