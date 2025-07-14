// 全局类型声明
declare global {
  interface Window {
    // index.astro 中的函数
    copyCommand: (command: string) => Promise<void>;
    showInstallGuide: () => void;
    hideInstallGuide: () => void;
    showDocumentation: () => void;
    
    // projects/manage.astro 中的函数
    selectProjectType: (type: string) => void;
    updateCommands: () => void;
    copyGeneratedCommand: (commandType: string) => Promise<void>;
    scrollToCommandBuilder: () => void;
    showLifecyclePhase: (phase: string) => void;
  }
}

export {}; 