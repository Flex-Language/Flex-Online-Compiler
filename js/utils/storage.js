/**
 * Storage utility for Flex Web Interpreter
 * Handles saving and loading programs using IndexedDB
 */
class FlexStorage {
  constructor() {
    this.dbName = 'FlexWebInterpreter';
    this.dbVersion = 1;
    this.storeName = 'programs';
    this.db = null;
    
    // Initialize the database
    this.initDatabase();
  }
  
  /**
   * Initialize the IndexedDB database
   * @returns {Promise} A promise that resolves when the database is ready
   */
  async initDatabase() {
    return new Promise((resolve, reject) => {
      // Check if IndexedDB is supported
      if (!window.indexedDB) {
        console.error('IndexedDB is not supported in this browser.');
        // Fall back to localStorage
        this.useLocalStorage = true;
        resolve();
        return;
      }
      
      const request = window.indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        // Fall back to localStorage
        this.useLocalStorage = true;
        resolve();
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('IndexedDB connected successfully');
        this.useLocalStorage = false;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create an object store for programs if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('lastModified', 'lastModified', { unique: false });
          console.log('Object store created');
        }
      };
    });
  }
  
  /**
   * Generate a unique ID
   * @returns {string} A unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
  
  /**
   * Save a program to storage
   * @param {string} name - Program name
   * @param {string} code - Program code
   * @returns {string} Program ID
   */
  saveProgram(name, code) {
    const program = {
      id: this.generateId(),
      name: name,
      code: code,
      lastModified: Date.now()
    };
    
    // Check if program with this name already exists
    const existingProgram = this.getProgramByName(name);
    if (existingProgram) {
      // Update existing program
      program.id = existingProgram.id;
    }
    
    if (this.useLocalStorage) {
      // Save to localStorage
      const programs = this.getLocalStoragePrograms();
      
      // Remove existing program with the same ID if it exists
      const index = programs.findIndex(p => p.id === program.id);
      if (index !== -1) {
        programs.splice(index, 1);
      }
      
      programs.push(program);
      localStorage.setItem('flexPrograms', JSON.stringify(programs));
    } else {
      // Save to IndexedDB
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      store.put(program);
    }
    
    return program.id;
  }
  
  /**
   * Load a program by ID
   * @param {string} id - Program ID
   * @returns {Object|null} The program object or null if not found
   */
  loadProgram(id) {
    if (this.useLocalStorage) {
      // Load from localStorage
      const programs = this.getLocalStoragePrograms();
      return programs.find(p => p.id === id) || null;
    } else {
      // Load from IndexedDB (async)
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(id);
        
        request.onsuccess = (event) => {
          resolve(event.target.result || null);
        };
        
        request.onerror = (event) => {
          console.error('Error loading program:', event.target.error);
          reject(event.target.error);
        };
      });
    }
  }
  
  /**
   * Get a program by name
   * @param {string} name - Program name
   * @returns {Object|null} The program object or null if not found
   */
  getProgramByName(name) {
    if (this.useLocalStorage) {
      // Get from localStorage
      const programs = this.getLocalStoragePrograms();
      return programs.find(p => p.name === name) || null;
    } else {
      // This is synchronous for simplicity, would be async in real implementation
      let result = null;
      
      // Use a synchronous approach using a transaction
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('name');
      
      // Open a cursor to the index
      const request = index.openCursor();
      
      // This will be executed synchronously due to the transaction
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.name === name) {
            result = cursor.value;
          } else {
            cursor.continue();
          }
        }
      };
      
      // Wait for the transaction to complete
      transaction.oncomplete = () => {};
      
      return result;
    }
  }
  
  /**
   * Delete a program
   * @param {string} id - Program ID
   * @returns {string|null} The name of the deleted program, or null if not found
   */
  deleteProgram(id) {
    let programName = null;
    
    if (this.useLocalStorage) {
      // Delete from localStorage
      const programs = this.getLocalStoragePrograms();
      const index = programs.findIndex(p => p.id === id);
      
      if (index !== -1) {
        programName = programs[index].name;
        programs.splice(index, 1);
        localStorage.setItem('flexPrograms', JSON.stringify(programs));
      }
    } else {
      // Delete from IndexedDB
      // First, get the program to return its name
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      // Get program name before deleting
      const getRequest = store.get(id);
      getRequest.onsuccess = (event) => {
        const program = event.target.result;
        if (program) {
          programName = program.name;
          
          // Now delete the program
          const deleteRequest = store.delete(id);
          deleteRequest.onerror = (event) => {
            console.error('Error deleting program:', event.target.error);
          };
        }
      };
    }
    
    return programName;
  }
  
  /**
   * List all saved programs
   * @returns {Array} Array of program objects
   */
  listPrograms() {
    if (this.useLocalStorage) {
      // List from localStorage
      return this.getLocalStoragePrograms();
    } else {
      // List from IndexedDB (sync for simplicity)
      const programs = [];
      
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('lastModified');
      
      // Get all programs sorted by lastModified (descending)
      const request = index.openCursor(null, 'prev');
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          programs.push(cursor.value);
          cursor.continue();
        }
      };
      
      // Wait for the transaction to complete
      transaction.oncomplete = () => {};
      
      return programs;
    }
  }
  
  /**
   * Get programs from localStorage
   * @returns {Array} Array of program objects
   */
  getLocalStoragePrograms() {
    const programsJson = localStorage.getItem('flexPrograms');
    return programsJson ? JSON.parse(programsJson) : [];
  }
}
