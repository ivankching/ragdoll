import { useState, type KeyboardEvent, type ChangeEvent} from 'react';
import { Trash } from "lucide-react";

interface ListDocument {
    id: number;
    title: string;
}

export function KnowledgeBaseList(): React.JSX.Element {
    const [documents, setDocuments] = useState<ListDocument[]>([
        { id: 1, title: "Learn React" },
        { id: 2, title: "Build a project" },
        { id: 3, title: "Deploy to production" }
    ]);

    // New item input state
    const [newDocument, setNewDocument] = useState<string>("");

    // Add a new item to the list
    const addDocument = (): void => {
        if (newDocument.trim() === "") return;
        
        const newId = documents.length > 0 ? Math.max(...documents.map(item => item.id)) + 1 : 1;
        setDocuments([...documents, { id: newId, title: newDocument }]);
        setNewDocument("");
    };
    
    // Handle key press (Enter) to add item
    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Enter") {
        e.preventDefault();
        addDocument();
        }
    };

    // Handle input change
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setNewDocument(e.target.value);
    };

    const deleteDocument = (id: number): void => {
        setDocuments(documents.filter(document => document.id !== id));
    };

     return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">My List</h2>
        
        {/* Add new document input */}
        <div className="mb-4 flex">
            <input
            type="text"
            value={newDocument}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Add new document"
            className="flex-1 border border-gray-300 rounded-l p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
            onClick={addDocument}
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 focus:outline-none"
            >
            Add
            </button>
        </div>
        
        {/* List of documents */}
        <ul className="divide-y divide-gray-200">
            {documents.length === 0 ? (
            <li className="py-3 text-gray-500 italic">No documents in the list</li>
            ) : (
            documents.map(document => (
                <li key={document.id} className="py-3 flex documents-center justify-between">
                <span>{document.title}</span>
                <button
                    onClick={() => deleteDocument(document.id)}
                    className="text-red-500 hover:text-red-700 focus:outline-none"
                    aria-label={`Delete ${document.title}`}
                >
                    <Trash size={18} />
                </button>
                </li>
            ))
            )}
        </ul>
        </div>
    );
}