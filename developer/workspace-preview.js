import{startWorkspaceHost}from'./runtime-20261028/workspace-bootstrap.js';
startWorkspaceHost({bridgeOrigin:'https://design-workspace-github-auth.mvisl1.workers.dev',workerURL:new URL('./private-worker.js',import.meta.url).href,scope:new URL('./',import.meta.url).pathname});
