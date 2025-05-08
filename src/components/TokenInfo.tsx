import React, { useState } from "react";
import { selectTokenInfo } from '../data/token';
import { useAppSelector } from "../app/hooks";

export default function TokenInfo() {
  const tokenInfo = useAppSelector(selectTokenInfo);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const totalPages = Math.ceil(tokenInfo.length / rowsPerPage);

  const displayedTokens = tokenInfo.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="mt-3 text-gray-900 dark:text-white px-4">
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold">#</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Token Index</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Address</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {displayedTokens.map((token, index) => (
              <tr key={index}>
                <td className="px-4 py-2">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                <td className="px-4 py-2">{token.tokenIdx}</td>
                <td className="px-4 py-2">{token.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    
      {/* Pagination */}
      <div className="flex justify-center items-center mt-4 space-x-1">
        <button
          className={`px-3 py-1 rounded border text-sm ${
            currentPage === 1
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-white dark:bg-gray-800 text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`px-3 py-1 rounded border text-sm ${
              currentPage === i + 1
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className={`px-3 py-1 rounded border text-sm ${
            currentPage === totalPages
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-white dark:bg-gray-800 text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  )
}