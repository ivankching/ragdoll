import React, { useState, useEffect, type SetStateAction } from 'react';
import type { Dispatch } from 'react';
import { FileText, Trash2, Download, Loader } from 'lucide-react';
import './KnowledgeBase.css';

const SERVER_URL: String = "http://127.0.0.1:8000";

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
      const response = await fetch(`${SERVER_URL}/knowledge-base`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },
  
  async deleteDocument(filename: string): Promise<void> {
    try {
      const response = await fetch(`${SERVER_URL}/knowledge-base/${filename}`, {
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
  
  async downloadDocument(filename: string): Promise<Blob> {
    try {
      const response = await fetch(`${SERVER_URL}/knowledge-base/${filename}`);
      
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

// Uploader for a single file
// TODO: pass KnowledgeBase prop setDocument to update based on file upload
const FileUploader = ({ documents, updateDocuments }: 
                      { documents: Document[], 
                        updateDocuments: Dispatch<SetStateAction<Document[]>> }) => {
  const [file, setFile] = useState<File | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      console.log("Uploading file");

      const formData: FormData = new FormData();
      formData.append('document', file);

      try {
        const result = await fetch(`${SERVER_URL}/knowledge-base/upload`, {
          method: "POST",
          body: formData
        });

        const data = await result.json();
        const newDoc: Document = {
          id: file.name,
          title: file.name
        }
        const newDocuments = documents.concat([newDoc]);
        updateDocuments(newDocuments);
        console.log(data);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <>
      <div className="input-group">
        <input id="file" type="file" onChange={handleFileChange} />
      </div>
      {file && (
        <section>
          File details:
          <ul>
            <li>Name: {file.name}</li>
            <li>Type: {file.type}</li>
            <li>Size: {file.size} bytes</li>
          </ul>
        </section>
      )}

      {file && (
        <button onClick={handleUpload} className="submit">
          Upload a file
        </button>
      )}
    </>
  );
}

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




  const handleDelete = async (filename: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        setIsDeleting(true);
        await DocumentService.deleteDocument(filename);
        setDocuments(documents.filter(doc => doc.title !== filename));
      } catch (err) {
        alert('Failed to delete document. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDocuments.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedDocuments.size} selected documents?`)) {
      try {
        setIsDeleting(true);
        const deletePromises = Array.from(selectedDocuments).map(title => 
          DocumentService.deleteDocument(title)
        );
        await Promise.all(deletePromises);
        
        setDocuments(documents.filter(doc => !selectedDocuments.has(doc.title)));
        setSelectedDocuments(new Set());
      } catch (err) {
        alert('Failed to delete some documents. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDownload = async (title: string) => {
    try {
      const blob = await DocumentService.downloadDocument(title);
      
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
      <div className="loading-container">
        <Loader className="loading-spinner" />
        <span className="loading-text">Loading documents...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button 
          className="retry-button"
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
      <div className="empty-container">
        <FileText className="empty-icon" />
        <h3 className="empty-title">No documents found</h3>
        <p className="empty-message">
          {searchQuery ? 'Try adjusting your search query' : 'Upload your first document to get started'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="document-list">
        {/* Header with actions */}
        <div className="document-header">
          <h2 className="document-title">
            Documents ({filteredAndSortedDocuments.length})
          </h2>
          
          {selectedDocuments.size > 0 && (
            <button
              className="delete-selected-button"
              onClick={handleBulkDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader className="button-icon spin" />
              ) : (
                <Trash2 className="button-icon" />
              )}
              Delete Selected ({selectedDocuments.size})
            </button>
          )}
        </div>

        {/* Document list */}
        <div className="document-table-container">
          <table className="document-table">
            <thead className="document-table-header">
              <tr>
                <th scope="col" className="checkbox-column">
                  <input
                    type="checkbox"
                    className="checkbox"
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
                <th scope="col" className="document-column">
                  Document
                </th>
                {/* <th scope="col" className="date-column">
                  Last Modified
                </th>
                <th scope="col" className="size-column">
                  Size
                </th> */}
                <th scope="col" className="actions-column">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedDocuments.map((document) => (
                <tr key={document.id} className="document-row">
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={selectedDocuments.has(document.id)}
                      onChange={() => toggleDocumentSelection(document.id)}
                    />
                  </td>
                  <td className="document-cell">
                    <div className="document-info">
                      <FileText className="document-icon" />
                      <div className="document-details">
                        <div className="document-name">{document.title}</div>
                        {/* <div className="document-created">Created: {formatDate(document.createdAt)}</div> */}
                      </div>
                    </div>
                  </td>
                  {/* <td className="date-cell">
                    {formatDate(document.updatedAt)}
                  </td>
                  <td className="size-cell">
                    {formatFileSize(document.fileSize)}
                  </td> */}
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button
                        className="download-button"
                        onClick={() => handleDownload(document.title)}
                      >
                        <Download className="action-icon" />
                      </button>
                      {/* <button
                        className="edit-button"
                      >
                        <Edit className="action-icon" />
                      </button> */}
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(document.title)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? <Loader className="action-icon spin" /> : <Trash2 className="action-icon" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <FileUploader documents= {documents} updateDocuments={setDocuments} />
    </>
    
  );
};

export default KnowledgeBase;