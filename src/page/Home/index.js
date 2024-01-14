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
    const [listUrl, setListUrl] = useState([])
    const [statics, setStatics] = useState({ total: 0, success: 0, failed: 0 })
    const [getCode, setGetCode] = useState({ path: '', port: null, num: null })
    const [portActive, setPortActive] = useState()
    const { post, get } = Requests()
    const initData = async () => {
        const staticsData = await get(`getInfoStatics`)
        console.log(staticsData)
        // setStatics((.data)
    }
    useEffect(() => {
        const pathGetVoice = localStorage.getItem('pathGetVoice') ? JSON.parse(localStorage.getItem('pathGetVoice')) : ''
        const tmp = { ...getCode, path: pathGetVoice }
        setGetCode(tmp)
        getListCurrentPhone(0)
        initData()
        handleHome([])
    }, [])

    const handleHome = async () => {
        try {
            const response = await get('http://trum99.ddns.net:5000/')
            console.log(response)
        } catch (error) {
            console.error('Error active port number:', error)
        }
    }

    const handleGetPhone = async () => {
        try {
            setIsLoading(true)
            const resAPI = await get(`http://trum99.ddns.net:5000/getAPI`)
            const response = await get(`http://trum99.ddns.net:5000/get-current-phone-active`)
            if (response?.data === -1) {
                openNotificationWithIcon('warning', 'Hây lấy hết phone hiện tại trước khi chạy lấy danh sách phone mới')
            } else if (response?.data && response?.data?.length === 0) {
                openNotificationWithIcon('warning', 'Không có số mới', response.data)
            } else {
                if (resAPI.data === 1) {
                    openNotificationWithIcon('info', 'Đã lấy phone thành công')
                }
                setListNum(response?.data && [])
            }
            getListCurrentPhone(0)
            setIsLoading(false)
        } catch (error) {
            console.error('Error active port number:', error)
        }
    }

    const getListCurrentPhone = async (check = 1) => {
        try {
            setIsLoading(true)
            const response = await get(`http://trum99.ddns.net:5000/get-list-current-phone`)
            if (check !== 0) {
                if (response.data && response.data.length === 0) {
                    openNotificationWithIcon('warning', 'Không có số mới', response.data)
                }
            }
            setListNum(response.data)
            setIsLoading(false)
        } catch (error) {
            console.error('Error active port number:', error)
        }
    }

    const handleGetOnePhone = async () => {
        try {
            setIsLoading(true)
            const response = await get('http://trum99.ddns.net:5000/get-phone')
            if (response.data !== -1) {
                openNotificationWithIcon('info', 'Phone', response.data)
            } else {
                openNotificationWithIcon('warning', 'Hết phone')
            }
            getListCurrentPhone(0)
            setIsLoading(false)
        } catch (error) {
            console.error('Error fetching phone number:', error)
        }
    }

    const handleActivePort = async () => {
        try {
            setIsLoading(true)
            const response = await get(`http://trum99.ddns.net:5000/active/${portActive}`)
            openNotificationWithIcon('info', response.data)
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
        let filePath = `${getCode.path}`.replaceAll('/', '\\')
        const body = {
            folderPath: filePath,
        }
        console.log('gọi api upload ==>lấy link')

        const intervalId = setInterval(async () => {
            const result = await post('http://localhost:5000/uploadFromPath', body)
            const dataUrl = await get('/getvoice/0/0')
            setStatics((await get(`http://trum99.ddns.net:5000/getInfoStatics`)).data)
            setListUrl(dataUrl.data.filter((data) => data !== null))

            console.log('RESULT->', result)
            if (result == undefined || result.status !== 200) {
                // setIsCopy(false)
                // setCopyText(null)
                openNotificationWithIcon('error', 'Thất bại', result.data.error)
            } else {
                openNotificationWithIcon('success', 'Thành công', result.data.message)
                // setIsCopy(true)
                // setCopyText(result.data.message.split('|->')[1])
            }
        }, 2000)

        // Clear interval khi component bị unmount để tránh memory leaks
        return () => clearInterval(intervalId)
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

    const handleReset = () => {
        try {
            setIsLoading(true)
            get(`http://trum99.ddns.net:5000/reset`)
            setIsLoading(false)
        } catch (error) {
            console.error('Error active port number:', error)
        }
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
                        onClick={handleReset()}
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
            title: 'Thành công',
            dataIndex: 'success',
            key: 'success',
            ...getColumnSearchProps('success'),
        },
        {
            title: 'Thất bại',
            dataIndex: 'failed',
            key: 'failed',
            ...getColumnSearchProps('failed'),
        },
        {
            title: 'Tổng phone',
            dataIndex: 'sum',
            key: 'sum',
            ...getColumnSearchProps('sum'),
        },
    ]
    const columns2 = [
        {
            title: 'port',
            dataIndex: 'port',
            key: 'port',
            ...getColumnSearchProps('port'),
        },
        {
            title: 'phone',
            dataIndex: 'phone',
            key: 'phone',
            ...getColumnSearchProps('phone'),
        },
        {
            title: 'url',
            dataIndex: 'url',
            key: 'url',
            ...getColumnSearchProps('url'),
        },
    ]
    return (
        <>
            {isLoading && <Spin size="large" fullscreen />}
            {contextHolder}
            <div>
                <h3>Thống kê</h3>
                <div>Tổng:{statics.total}</div>
                <div>Thành công:{statics.success}</div>
                <div>Thất bại:{statics.failed}</div>
            </div>
            <div style={{ width: '100%', display: 'flex' }}>
                <div style={{ width: '20%', margin: '10px' }}>
                    <Button type="primary" icon={<RocketOutlined />} onClick={handleGetPhone}>
                        {' '}
                        Chạy lấy số điện thoại
                    </Button>
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
                <div style={{ width: '20%', margin: '10px', marginTop: 30 }}>
                    <Button type="primary" icon={<DownloadOutlined />} onClick={handleGetVoice}>
                        Bắt Đầu Lấy Link Voice
                    </Button>
                </div>
            </div>
            <Table style={{ margin: '20px 80px' }} dataSource={listUrl} columns={columns2} />
        </>
    )
}
export default Home
