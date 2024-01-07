import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { Button, Flex, notification, Input, Spin, Table, Space } from 'antd'
import { DownloadOutlined, RocketOutlined, CopyOutlined, SearchOutlined, DeliveredProcedureOutlined } from '@ant-design/icons'
import Highlighter from 'react-highlight-words'

import './styles.css'
import { Requests } from '../../utils/request'

function Home() {
    const [api, contextHolder] = notification.useNotification()
    const [isLoading, setIsLoading] = useState(false)
    const [listNum, setListNum] = useState([])
    const [getCode, setGetCode] = useState({ path: '', port: null, num: null })
    const [portActive, setPortActive] = useState()
    const { post, get } = Requests()
    useEffect(() => {
        const pathGetVoice = localStorage.getItem('pathGetVoice') ? JSON.parse(localStorage.getItem('pathGetVoice')) : ''
        const tmp = { ...getCode, path: pathGetVoice }
        setGetCode(tmp)
        getListCurrentPhone()
    }, [])

    const handleGetPhone = async () => {
        try {
            setIsLoading(true)
            const response = await get(`http://localhost:5000/get-list-phone-active`)
            setListNum(response.data)
            setIsLoading(false)
        } catch (error) {
            console.error('Error active port number:', error)
        }
    }

    const getListCurrentPhone = async () => {
        try {
            setIsLoading(true)
            const response = await get(`http://localhost:5000/get-list-current-phone`)
            setListNum(response.data)
            setIsLoading(false)
        } catch (error) {
            console.error('Error active port number:', error)
        }
    }

    const handleGetOnePhone = async () => {
        try {
            setIsLoading(true)
            const response = await get('http://localhost:5000/get-phone')
            openNotificationWithIcon('info', 'Phone', response.data)
            getListCurrentPhone()
            setIsLoading(false)
        } catch (error) {
            console.error('Error fetching phone number:', error)
        }
    }

    const handleActivePort = async () => {
        try {
            setIsLoading(true)
            const response = await get(`http://localhost:5000/active/${portActive}`)
            openNotificationWithIcon('info', response.data)
            getListCurrentPhone()
            setIsLoading(false)
        } catch (error) {
            console.error('Error active port number:', error)
        }
    }

    const [isCopy, setIsCopy] = useState(false)
    const [copyText, setCopyText] = useState('1233333')
    const handleGetVoice = async () => {
        //save path xuống localstorage
        localStorage.setItem('pathGetVoice', JSON.stringify(getCode.path))
        let filePath = `${getCode.path}\\${getCode.port}\\${getCode.num}\\${getCode.port}_${getCode.num}.mp4`.replaceAll('/', '\\')
        const body = {
            filePath: filePath,
        }
        console.log('gọi api upload ==>lấy link')
        const result = await post('uploadFromPath', body)
        console.log('RESULT->', result)
        if (result.status !== 200) {
            setIsCopy(false)
            setCopyText(null)
            openNotificationWithIcon('error', 'Thất bại', result.data.error)
        } else {
            openNotificationWithIcon('success', 'Thành công', result.data.message)
            setIsCopy(true)
            setCopyText(result.data.message.split('|->')[1])
        }
    }
    const handleOnchangeInput = (e) => {
        console.log(e)
        let tmp = { ...getCode }
        tmp[`${e.target.name}`] = e.target.value
        console.log(tmp)
        setGetCode(tmp)
    }
    const openNotificationWithIcon = (type, msg, desc) => {
        api[type]({
            message: msg,
            description: desc,
        })
    }
    const [searchText, setSearchText] = useState('')
    const [searchedColumn, setSearchedColumn] = useState('')
    const searchInput = useRef(null)
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm()
        setSearchText(selectedKeys[0])
        setSearchedColumn(dataIndex)
    }
    const handleReset = (clearFilters) => {
        clearFilters()
        setSearchText('')
    }
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({
                                closeDropdown: false,
                            })
                            setSearchText(selectedKeys[0])
                            setSearchedColumn(dataIndex)
                        }}
                    >
                        Filter
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close()
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1677ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100)
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{
                        backgroundColor: '#ffc069',
                        padding: 0,
                    }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    })
    const columns = [
        {
            title: 'Port',
            dataIndex: 'port',
            key: 'port',
            ...getColumnSearchProps('port'),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'num',
            key: 'num',
            ...getColumnSearchProps('num'),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            ...getColumnSearchProps('status'),
        },
    ]
    return (
        <>
            {isLoading && <Spin size="large" fullscreen />}
            {contextHolder}
            <div style={{ width: '100%', display: 'flex' }}>
                <div style={{ width: '20%', margin: '10px' }}>
                    <Button type="primary" icon={<RocketOutlined />} onClick={handleGetPhone}>
                        {' '}
                        Chạy lấy số điện thoại
                    </Button>
                </div>
                <div style={{ width: '20%', margin: '10px' }}>
                    <Button type="primary" icon={<DeliveredProcedureOutlined />} onClick={handleGetOnePhone}>
                        {' '}
                        Lấy 1 số
                    </Button>
                </div>

                <div style={{ width: '20%', margin: '10px' }}>
                    <Input
                        onChange={(e) => {
                            setPortActive(e.target.value)
                        }}
                        value={portActive}
                        name="port"
                        placeholder="vui lòng nhập port"
                    ></Input>
                    <Button onClick={handleActivePort}> Active Port</Button>
                </div>
                <div style={{ width: '20%', margin: '10px' }}>
                    <Button danger onClick={handleGetPhone}>
                        Restart
                    </Button>
                </div>
            </div>
            <Table style={{ margin: '20px 80px' }} dataSource={listNum} columns={columns} />

            <div style={{ width: '100%', display: 'flex' }}>
                <div style={{ width: '40%', margin: '10px' }}>
                    <span>Path:</span>
                    <Input
                        onChange={(e) => {
                            handleOnchangeInput(e)
                        }}
                        name="path"
                        value={getCode.path}
                        placeholder="Vui lòng nhập vào đường dẫn chứa voice"
                    ></Input>
                </div>
                <div style={{ width: '10%', margin: '10px' }}>
                    <span>Port:</span>
                    <Input
                        onChange={(e) => {
                            handleOnchangeInput(e)
                        }}
                        name="port"
                        value={getCode.port}
                        placeholder="Vui lòng nhập vào port"
                    ></Input>
                </div>
                <div style={{ width: '30%', margin: '10px' }}>
                    <span>Number Phone:</span>
                    <Input
                        onChange={(e) => {
                            handleOnchangeInput(e)
                        }}
                        name="num"
                        value={getCode.num}
                        placeholder="Vui lòng nhập số điện thoại"
                    ></Input>
                </div>
                <div style={{ width: '20%', margin: '10px', marginTop: 30 }}>
                    <Button type="primary" icon={<DownloadOutlined />} onClick={handleGetVoice}>
                        Lấy Link Voice
                    </Button>
                </div>
                {isCopy && (
                    <div style={{ width: '15%', margin: '10px', marginTop: 30 }}>
                        <Button
                            icon={<CopyOutlined />}
                            onClick={() => {
                                navigator.clipboard.writeText(copyText)
                                openNotificationWithIcon('info', 'Đã copy nội dung', copyText)
                            }}
                        >
                            Copy Link Voice
                        </Button>
                    </div>
                )}
            </div>
        </>
    )
}
export default Home
