/* eslint-disable prefer-rest-params */
export const after = (method) => (target, key, descriptor) => {
  const currentMethod = descriptor.value;

  Object.assign(descriptor, {
    value: function value () {
      return method.call(this, currentMethod.apply(this, arguments));
    },
  });
};
