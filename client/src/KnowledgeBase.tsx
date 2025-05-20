import React, { useState, useEffect } from 'react';
import { FileText, Trash2, Download, Loader } from 'lucide-react';

// Document type definition
interface Document {
  id: string;
  title: string;
//   createdAt: string;
//   updatedAt: string;
//   fileSize: number;
//   fileType: string;
}

// Props for the KnowledgeBase component
interface KnowledgeBaseProps {
  searchQuery?: string;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'fileSize';
  sortDirection?: 'asc' | 'desc';
}

// API service for document operations
const DocumentService = {
  async getDocuments(): Promise<Document[]> {
    try {
      const response = await fetch('http://127.0.0.1:8000/knowledge-base');
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },
  
  // DOES NOT WORK
  async deleteDocument(id: string): Promise<void> {
    try {
      const response = await fetch(`http://127.0.0.1:8000/knowledge-base/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },
  
  // DOES NOT WORK
  async downloadDocument(id: string): Promise<Blob> {
    try {
      const response = await fetch(`http://127.0.0.1:8000/knowledge-base/${id}/download`);
      
      if (!response.ok) {
        throw new Error('Failed to download document');
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }
};

// // Utility function to format file size
// const formatFileSize = (bytes: number): string => {
//   if (bytes === 0) return '0 Bytes';
  
//   const k = 1024;
//   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
  
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
// };

// Utility function to format date
// const formatDate = (dateString: string): string => {
//   const date = new Date(dateString);
//   return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
// };

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ 
  searchQuery = '', 
//   sortBy = 'updatedAt', 
  sortDirection = 'desc' 
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch documents when component mounts
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const data = await DocumentService.getDocuments();
        setDocuments(data);
        setError(null);
      } catch (err) {
        setError('Failed to load documents. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Filter and sort documents
//   const filteredAndSortedDocuments = documents
//     .filter(doc => doc.title.toLowerCase().includes(searchQuery.toLowerCase()))
//     .sort((a, b) => {
//       if (sortBy === 'title') {
//         return sortDirection === 'asc' 
//           ? a.title.localeCompare(b.title) 
//           : b.title.localeCompare(a.title);
//       } 
      
//       if (sortBy === 'fileSize') {
//         return sortDirection === 'asc' 
//           ? a.fileSize - b.fileSize 
//           : b.fileSize - a.fileSize;
//       }
      
//       // Default sort by dates
//       const dateA = new Date(a[sortBy]).getTime();
//       const dateB = new Date(b[sortBy]).getTime();
//       return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
//     });

  // Filter and sort documents
  const filteredAndSortedDocuments = documents
    .filter(doc => doc.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
        return sortDirection === 'asc' 
          ? a.title.localeCompare(b.title) 
          : b.title.localeCompare(a.title);
      });

  // Handle document selection
  const toggleDocumentSelection = (id: string) => {
    const newSelectedDocs = new Set(selectedDocuments);
    if (newSelectedDocs.has(id)) {
      newSelectedDocs.delete(id);
    } else {
      newSelectedDocs.add(id);
    }
    setSelectedDocuments(newSelectedDocs);
  };




  // DOES NOT WORK: Handle document deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        setIsDeleting(true);
        await DocumentService.deleteDocument(id);
        setDocuments(documents.filter(doc => doc.id !== id));
      } catch (err) {
        alert('Failed to delete document. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // DOES NOT WORK: Handle bulk document deletion
  const handleBulkDelete = async () => {
    if (selectedDocuments.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedDocuments.size} selected documents?`)) {
      try {
        setIsDeleting(true);
        const deletePromises = Array.from(selectedDocuments).map(id => 
          DocumentService.deleteDocument(id)
        );
        await Promise.all(deletePromises);
        
        setDocuments(documents.filter(doc => !selectedDocuments.has(doc.id)));
        setSelectedDocuments(new Set());
      } catch (err) {
        alert('Failed to delete some documents. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // DOES NOT WORK: Handle document download
  const handleDownload = async (id: string, title: string) => {
    try {
      const blob = await DocumentService.downloadDocument(id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = title;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download document. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Loading documents...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        <p>{error}</p>
        <button 
          className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (filteredAndSortedDocuments.length === 0) {
    return (
      <div className="p-8 text-center">
        <FileText className="w-16 h-16 mx-auto text-gray-400" />
        <h3 className="mt-4 text-xl font-semibold text-gray-700">No documents found</h3>
        <p className="mt-2 text-gray-500">
          {searchQuery ? 'Try adjusting your search query' : 'Upload your first document to get started'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header with actions */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Documents ({filteredAndSortedDocuments.length})
        </h2>
        
        {selectedDocuments.size > 0 && (
          <button
            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
            onClick={handleBulkDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Delete Selected ({selectedDocuments.size})
          </button>
        )}
      </div>

      {/* Document list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDocuments(new Set(documents.map(doc => doc.id)));
                    } else {
                      setSelectedDocuments(new Set());
                    }
                  }}
                  checked={selectedDocuments.size === documents.length && documents.length > 0}
                />
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Document
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Modified
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedDocuments.map((document) => (
              <tr key={document.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={selectedDocuments.has(document.id)}
                    onChange={() => toggleDocumentSelection(document.id)}
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <FileText className="flex-shrink-0 h-5 w-5 text-gray-500" />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{document.title}</div>
                      {/* <div className="text-xs text-gray-500">Created: {formatDate(document.createdAt)}</div> */}
                    </div>
                  </div>
                </td>
                {/* <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(document.updatedAt)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatFileSize(document.fileSize)}
                </td> */}
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      className="p-1 text-blue-600 hover:text-blue-800"
                      onClick={() => handleDownload(document.id, document.title)}
                    >
                      <Download className="h-5 w-5" />
                    </button>
                    {/* <button
                      className="p-1 text-green-600 hover:text-green-800"
                    >
                      <Edit className="h-5 w-5" />
                    </button> */}
                    <button
                      className="p-1 text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(document.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? <Loader className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KnowledgeBase;