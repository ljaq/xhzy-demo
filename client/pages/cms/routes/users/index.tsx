import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { Button, Table, Modal, Form, Input, message, Space, Popconfirm } from 'antd'
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useUserStore } from 'client/stores'
import * as styles from './styles.css'
import type { UserModelType } from 'client/stores/UserStore'

const UsersPage = observer(() => {
  const userStore = useUserStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserModelType | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    userStore.fetchUsers()
  }, [])

  const handleCreate = () => {
    setEditingUser(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (user: UserModelType) => {
    setEditingUser(user)
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      avatar: user.avatar || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await userStore.deleteUser(id)
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingUser) {
        await userStore.updateUserById(editingUser.id, values)
        message.success('更新成功')
      } else {
        await userStore.createUser(values)
        message.success('创建成功')
      }
      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      message.error(editingUser ? '更新失败' : '创建失败')
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (avatar: string) => (avatar ? <img src={avatar} alt='avatar' className={styles.avatar} /> : '-'),
    },
    {
      title: '文章数',
      key: 'postCount',
      render: (_: any, record: UserModelType) => record.postCount,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: UserModelType) => (
        <Space>
          <Button type='link' icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title='确定要删除这个用户吗？'
            onConfirm={() => handleDelete(record.id)}
            okText='确定'
            cancelText='取消'
          >
            <Button type='link' danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <UserOutlined /> 用户管理
        </h2>
        <Button type='primary' icon={<PlusOutlined />} onClick={handleCreate}>
          新建用户
        </Button>
      </div>

      {userStore.error && <div className={styles.error}>{userStore.error}</div>}

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>总用户数：</span>
          <span className={styles.statValue}>{userStore.totalUsers}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>总文章数：</span>
          <span className={styles.statValue}>{userStore.totalPosts}</span>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={userStore.users.slice()}
        rowKey='id'
        loading={userStore.loading}
        className={styles.table}
      />

      <Modal
        title={editingUser ? '编辑用户' : '新建用户'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        okText='确定'
        cancelText='取消'
      >
        <Form form={form} layout='vertical'>
          <Form.Item name='name' label='姓名' rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder='请输入姓名' />
          </Form.Item>
          <Form.Item
            name='email'
            label='邮箱'
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder='请输入邮箱' />
          </Form.Item>
          <Form.Item name='avatar' label='头像URL'>
            <Input placeholder='请输入头像URL（可选）' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
})

UsersPage.pageConfig = {
  name: '用户管理',
  order: 0,
  icon: <UserOutlined />,
}

export default UsersPage
