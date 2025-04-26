/**
 * Virtual File System for Flex Web Interpreter
 * Allows saving and loading programs in the browser using localStorage
 */
class VirtualFileSystem {
  constructor() {
    this.files = {};
    this.persistentStorage = window.localStorage;
    this.storageKey = 'flex_files';
    this.loadFromStorage();
  }
  
  /**
   * Load files from localStorage
   */
  loadFromStorage() {
    try {
      const stored = this.persistentStorage.getItem(this.storageKey);
      if (stored) {
        this.files = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load files from storage', e);
      // Initialize with empty files object if loading fails
      this.files = {};
    }
  }
  
  /**
   * Save files to localStorage
   */
  saveToStorage() {
    try {
      this.persistentStorage.setItem(this.storageKey, JSON.stringify(this.files));
      return true;
    } catch (e) {
      console.error('Failed to save files to storage', e);
      return false;
    }
  }
  
  /**
   * Read a file from the virtual file system
   * @param {string} path - File path/name
   * @returns {string|null} File content or null if not found
   */
  readFile(path) {
    if (this.files[path]) {
      return this.files[path].content;
    }
    return null;
  }
  
  /**
   * Write a file to the virtual file system
   * @param {string} path - File path/name
   * @param {string} content - File content
   * @returns {boolean} Success status
   */
  writeFile(path, content) {
    this.files[path] = {
      content,
      created: this.files[path]?.created || Date.now(),
      modified: Date.now()
    };
    return this.saveToStorage();
  }
  
  /**
   * Delete a file from the virtual file system
   * @param {string} path - File path/name
   * @returns {boolean} Success status
   */
  deleteFile(path) {
    if (this.files[path]) {
      delete this.files[path];
      return this.saveToStorage();
    }
    return false;
  }
  
  /**
   * List all files in the virtual file system
   * @returns {Array} Array of file metadata objects
   */
  listFiles() {
    return Object.keys(this.files).map(path => ({
      path,
      name: path.split('/').pop(),
      created: this.files[path].created,
      modified: this.files[path].modified
    }));
  }
  
  /**
   * Export all files as a JSON string (for backup)
   * @returns {string} JSON string of all files
   */
  exportFiles() {
    return JSON.stringify(this.files);
  }
  
  /**
   * Import files from a JSON string (for restore)
   * @param {string} jsonData - JSON string of files
   * @returns {boolean} Success status
   */
  importFiles(jsonData) {
    try {
      const importedFiles = JSON.parse(jsonData);
      
      // Validate imported data structure
      if (typeof importedFiles !== 'object') {
        throw new Error('Invalid import data format');
      }
      
      // Merge with existing files
      this.files = {...this.files, ...importedFiles};
      return this.saveToStorage();
    } catch (e) {
      console.error('Failed to import files', e);
      return false;
    }
  }
  
  /**
   * Clear all files from the virtual file system
   * @returns {boolean} Success status
   */
  clearFiles() {
    this.files = {};
    return this.saveToStorage();
  }
}
