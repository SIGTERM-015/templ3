export default {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  edgeExternals: ["node:crypto"],
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  build: {
    esbuildOptions: (options: any) => {
      // Add 'workerd' condition for pg-cloudflare to resolve correctly
      // This fixes: "CloudflareSocket is not a constructor" error
      options.conditions = ['workerd', ...(options.conditions || [])];
      options.logOverride = {
        ...options.logOverride,
        'direct-eval': 'silent',
        'impossible-typeof': 'silent',
      };
      return options;
    },
  },
};
