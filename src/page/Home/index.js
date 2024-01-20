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
    const [statistic, setStatistic] = useState({ total: 0, success: 0, fail: 0 })
    const [getCode, setGetCode] = useState({ path: '', port: null, num: null })
    const { post, get } = Requests()
    const getCurrentDate = () => {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }
    const [dateStatic, setDateStatic] = useState(getCurrentDate())
    const initData = async () => {
        // const staticsData = await get(`getInfoStatics/${dateStatic}`)
        // console.log(staticsData)
        // setStatics((.data)
    }
    useEffect(() => {
        const pathGetVoice = localStorage.getItem('pathGetVoice') ? JSON.parse(localStorage.getItem('pathGetVoice')) : ''
        const tmp = { ...getCode, path: pathGetVoice }
        setGetCode(tmp)
        getListCurrentPhone(0)
        getStatistic()
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
            const response = await get(`http://trum99.ddns.net:5000/get-list-phone-active`)
            if (response?.data === -1) {
                openNotificationWithIcon('warning', 'Hây lấy hết phone hiện tại trước khi chạy lấy danh sách phone mới')
            } else if (response?.data && response?.data?.length === 0) {
                openNotificationWithIcon('warning', 'Không có số mới', response.data)
            }
            setListNum(response?.data)
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

    const getStatistic = async () => {
        try {
            const response = await get(`http://trum99.ddns.net:5000/statistic`)
            const data = response.data
            if (data) {
                setStatistic(data)
                if (parseInt(data.success) + parseInt(data.fail) === data.total && parseInt(data.total) !== 0) {
                    openNotificationWithIcon('warning', 'Đã lấy hết số, hãy thay sim mới')
                }
            }
        } catch (error) {
            console.error('Error getStatistic:', error)
        }
    }

    useEffect(() => {
        console.log('---=>', statics)
    }, [statics])
    useEffect(() => {
        let filePath = `C:\\Users\\DK\\Documents\\WYT\\DangsModem\\DangsModem\\Voices\\backup`.replaceAll('/', '\\')
        const body = {
            folderPath: filePath,
        }

        const intervalId = setInterval(async () => {
            const result = await post('http://localhost:5000/uploadFromPath', body)
            // const dataUrl = await get('/getvoice/0/0')
            setStatics((await get(`http://trum99.ddns.net:5000/getInfoStatics/${dateStatic}`)).data)
            //setListUrl(dataUrl.data.filter((data) => data !== null))

            // console.log('RESULT->', result)
            // if (result == undefined || result.status !== 200) {
            //     // setIsCopy(false)
            //     // setCopyText(null)
            //     openNotificationWithIcon('error', 'Thất bại', result.data.error)
            // } else {
            //     openNotificationWithIcon('success', 'Thành công', result.data.message)
            //     // setIsCopy(true)
            //     // setCopyText(result.data.message.split('|->')[1])
            // }
        }, 2000)

        // Clear interval khi component bị unmount để tránh memory leaks
        return () => clearInterval(intervalId)
    }, [dateStatic])

    const handleGetVoice = async () => {
        //save path xuống localstorage
        localStorage.setItem('pathGetVoice', JSON.stringify(getCode.path))
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
            title: 'Phone Number',
            dataIndex: 'num',
            key: 'num',
            ...getColumnSearchProps('num'),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            ...getColumnSearchProps('status'),
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
            <div style={{ width: '100%', display: 'flex' }}>
                <div style={{ width: '50%' }}>
                    <h3>STATICS DATE:{dateStatic}</h3>
                    <div>TOTAL:{statics.total}</div>
                    <div>SUCCESS:{statics.success}</div>
                    <div>FAILED:{statics.failed}</div>
                </div>

                <div style={{ width: '50%' }}>
                    <h3>Statistics on the number of sims</h3>
                    <div>Total Phone:{statistic.total}</div>
                    <div>Success:{statistic.success}</div>
                    <div>failed:{statistic.fail}</div>
                </div>
            </div>
            <div style={{ width: '100%', display: 'flex' }}>
                <div style={{ width: '40%', margin: '10px' }}>
                    <span>Date statics:</span>
                    <Input
                        onChange={(e) => {
                            console.log('set lại giá trị ', e.target.value)
                            setDateStatic(e.target.value)
                        }}
                        name="path"
                        value={dateStatic}
                        placeholder="Vui lòng nhập vào đường dẫn chứa voice"
                    ></Input>
                </div>
            </div>
            <div style={{ width: '100%', display: 'flex' }}>
                <div style={{ width: '20%', margin: '10px' }}>
                    <Button type="primary" icon={<RocketOutlined />} onClick={handleGetPhone}>
                        {' '}
                        RUN GET PHONE
                    </Button>
                </div>
            </div>
            <Table style={{ margin: '20px 80px' }} dataSource={listNum} columns={columns} />
        </>
    )
}
export default Home
