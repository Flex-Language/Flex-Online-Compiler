/**
 * Flex Environment
 * Handles variable and function scope management
 */
class Environment {
  constructor(enclosing = null) {
    this.values = {};
    this.enclosing = enclosing;
  }
  
  /**
   * Define a variable in the current environment
   * @param {string} name - Variable name
   * @param {*} value - Variable value
   */
  define(name, value) {
    this.values[name] = value;
  }
  
  /**
   * Assign a value to an existing variable
   * @param {string} name - Variable name
   * @param {*} value - New value
   * @throws {Error} If variable is not defined
   */
  assign(name, value) {
    if (name in this.values) {
      this.values[name] = value;
      return;
    }
    
    if (this.enclosing !== null) {
      this.enclosing.assign(name, value);
      return;
    }
    
    throw new Error(`Undefined variable '${name}'.`);
  }
  
  /**
   * Get the value of a variable
   * @param {string} name - Variable name
   * @returns {*} Variable value
   * @throws {Error} If variable is not defined
   */
  get(name) {
    if (name in this.values) {
      return this.values[name];
    }
    
    if (this.enclosing !== null) {
      return this.enclosing.get(name);
    }
    
    throw new Error(`Undefined variable '${name}'.`);
  }
  
  /**
   * Check if a variable exists in this environment or any parent
   * @param {string} name - Variable name
   * @returns {boolean} True if the variable exists
   */
  exists(name) {
    if (name in this.values) {
      return true;
    }
    
    if (this.enclosing !== null) {
      return this.enclosing.exists(name);
    }
    
    return false;
  }
  
  /**
   * Get a variable from an ancestor environment
   * @param {number} distance - How many environments up to look
   * @param {string} name - Variable name
   * @returns {*} Variable value
   */
  getAt(distance, name) {
    return this.ancestor(distance).values[name];
  }
  
  /**
   * Assign a value to a variable in an ancestor environment
   * @param {number} distance - How many environments up to look
   * @param {string} name - Variable name
   * @param {*} value - New value
   */
  assignAt(distance, name, value) {
    this.ancestor(distance).values[name] = value;
  }
  
  /**
   * Get an ancestor environment at the specified distance
   * @param {number} distance - How many environments up to look
   * @returns {Environment} The ancestor environment
   */
  ancestor(distance) {
    let environment = this;
    for (let i = 0; i < distance; i++) {
      environment = environment.enclosing;
    }
    
    return environment;
  }
}
