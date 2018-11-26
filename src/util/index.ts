export interface IEvents {
    [key: string]: (v?: any) => void;
  }
  
  export function excuteEvent(ev: IEvents, v?: any) {
    console.log("excuteEvent", ev);
    Object.keys(ev).forEach(key => {
      ev[key](v);
    });
  }
  