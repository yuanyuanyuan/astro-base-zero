// 全局类型声明
declare global {
  interface Window {
    // 项目管理相关函数
    selectProjectType: (type: string) => void;
    updateCommands: () => void;
    copyGeneratedCommand: (commandType: string) => Promise<void>;
    copyCommand: (command: string) => Promise<void>;
    scrollToCommandBuilder: () => void;
    showLifecyclePhase: (phase: string) => void;
  }
}

export {}; 