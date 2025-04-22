function deepCopy<T>(inputObject: T): T {
  // Return the value if inputObject is not an Object data
  // Need to notice typeof null is 'object'
  if (typeof inputObject !== 'object' || inputObject === null) {
    return inputObject;
  }

  // Create an array or object to hold the values
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const outputObject: any = Array.isArray(inputObject) ? [] : {};

  // Recursively deep copy for nested objects, including arrays
  for (const key in inputObject) {
    if (Object.prototype.hasOwnProperty.call(inputObject, key)) {
      const value = inputObject[key];
      outputObject[key] = deepCopy(value);
    }
  }

  return outputObject as T;
}

export { deepCopy };
