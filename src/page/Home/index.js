import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Button, Flex,notification, Input, Spin, Table } from 'antd';
import { DownloadOutlined ,CopyOutlined } from '@ant-design/icons';

import "./styles.css";
import { Requests } from "../../utils/request";


function Home() {
  const [api, contextHolder] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [listNum, setListNum] = useState([]);
  const [getCode, setGetCode] = useState({ path: "", port: null, num: null });
  const {post} = Requests();
  useEffect(() => {
    const getData = localStorage.getItem('arrNum') ? JSON.parse(localStorage.getItem('arrNum')) : [];
    const pathGetVoice = localStorage.getItem('pathGetVoice') ? JSON.parse(localStorage.getItem('pathGetVoice')) : '';
    const tmp={...getCode,path:pathGetVoice}
    setGetCode(tmp)
    setListNum(getData)
  }, [])
  const handleGetPhone = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const data = '1|1F8D26E09D6BE929CE53739C7A9C032C755F647B9F97EA15|2024-01-03T21:58:24|zaf|27||COM104|720389914'
    setIsLoading(false);
    // Tách chuỗi thành mảng bằng dấu "|"
    const parts = data.split('|');
    if (parts[0] == -1 || parts.length == 0) {
      //xử lý thất bại
      alert("gọi thất bại");
    }
    const port = parts[parts.length - 2].replace('COM', ''); // Loại bỏ 'COM'
    const num = parts[parts.length - 1];
    const result = { port: parseInt(port), num: num, status: 1 };
    const saveData = localStorage.getItem('arrNum') ? JSON.parse(localStorage.getItem('arrNum')) : [];
    saveData.push(result);
    for (let index = 0; index < 10; index++) {
      const element = { port: parseInt(port), num: num + index, status: 1 };
      saveData.push(element);
            
    }
    localStorage.setItem('arrNum', JSON.stringify(saveData));
    setListNum(saveData);
    
  }
  const columns = [
    {
      title: 'port',
      dataIndex: 'port',
      key: 'port',
    },
    {
      title: 'num',
      dataIndex: 'num',
      key: 'num',
    },
    {
      title: 'status',
      dataIndex: 'status',
      key: 'status',
    },
  ];
  const [isCopy, setIsCopy] = useState(false);
  const [copyText, setCopyText] = useState('1233333');
  const handleGetVoice = async() => {
    //save path xuống localstorage
    localStorage.setItem('pathGetVoice', JSON.stringify(getCode.path));
    let filePath = `${getCode.path}\\${getCode.port}\\${getCode.num}\\${getCode.port}_${getCode.num}.mp4`.replaceAll("/", "\\");
    const body = {
      filePath:filePath
    }
    console.log('gọi api upload ==>lấy link');
    const result = await post('uploadFromPath', body);
    console.log("RESULT->", result);
    if (result.status !== 200) {
      setIsCopy(false);
      setCopyText(null)
      openNotificationWithIcon('error',"Thất bại",result.data.error)
    }
    else {
      openNotificationWithIcon('success', "Thành công", result.data.message)
      setIsCopy(true);
      setCopyText(result.data.message.split("|->")[1])
    }
    
  }
  const handleOnchangeInput = (e) => {
    console.log(e);
    let tmp = { ...getCode };
    tmp[`${e.target.name}`] = e.target.value;
    console.log(tmp);
    setGetCode(tmp);
  }
  const openNotificationWithIcon = (type,msg,desc) => {
    api[type]({
      message: msg,
      description:
      desc,
    });
  };
    return <>
        {isLoading && <Spin size="large" fullscreen />}
        {contextHolder}

<Table dataSource={listNum} columns={columns} />
      <Button onClick={handleGetPhone}> Chạy lấy số điện thoại</Button>
      <div style={{ width: "100%" ,display:"flex"}}>
        <div style={{ width: '40%',margin: '10px' }}>
          <span>Path:</span>
          <Input onChange={(e)=>{handleOnchangeInput(e)}} name="path" value={getCode.path} placeholder="Vui lòng nhập vào đường dẫn chứa voice"></Input>
        </div>
        <div style={{ width: '10%' ,margin: '10px'}}>
          <span>Port:</span>
          <Input onChange={(e)=>{handleOnchangeInput(e)}} name="port" value={getCode.port} placeholder="Vui lòng nhập vào port"></Input>
        </div>
        <div style={{ width: '30%',margin: '10px' }}>
          <span>Number Phone:</span>
          <Input onChange={(e)=>{handleOnchangeInput(e)}} name="num"  value={getCode.num} placeholder="Vui lòng nhập số điện thoại"></Input>
        </div>
        <div style={{ width: '20%',margin: '10px',marginTop:30 }}>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleGetVoice}>Lấy Link Voice</Button>
        </div>
        {isCopy&&<div style={{ width: '15%',margin: '10px',marginTop:30 }}>
          <Button icon={<CopyOutlined />} onClick={() => {
            navigator.clipboard.writeText(copyText)
            openNotificationWithIcon('info',"Đã copy nội dung",copyText)
          }}>Copy Link Voice</Button>
        </div>}

      </div>
    </>
}
 export default Home