import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import Button from '../../../components/Button/Button'
import GradientDiv from '../../../components/GradientDiv/GradientDiv'
import { H5 } from '../../../components/Text/Heading/Heading'
import { api } from '../../../redux/services/api'
import { inviteMemberAction } from '../../../redux/slices/householdsSlice'
import { AppDispatch } from '../../../redux/store/store'
import './InviteMember.sass'

interface User {
    _id: string
    name: string
    surname: string
    email: string
}

interface InviteMemberProps {
    isOpen: boolean
    onClose: () => void
    householdId: string
    existingMembers: string[]
    invitedUsers: string[]
}

const InviteMember: React.FC<InviteMemberProps> = ({ isOpen, onClose, householdId, existingMembers, invitedUsers }) => {
    const { t } = useTranslation()
    const dispatch = useDispatch<AppDispatch>()
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<User[]>([])
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const searchUsers = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([])
                return
            }

            try {
                const response = await api.get(`/user/search?query=${encodeURIComponent(searchQuery)}`)
                const filteredUsers = response.data.data.filter(
                    (user: User) => !existingMembers.includes(user._id) && !invitedUsers.includes(user._id),
                )
                setSearchResults(filteredUsers)
            } catch (err) {
                console.error('Error searching users:', err)
                setSearchResults([])
            }
        }

        const timeoutId = setTimeout(searchUsers, 300)
        return () => clearTimeout(timeoutId)
    }, [searchQuery, existingMembers, invitedUsers])

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault()
        }

        if (!selectedUser) {
            setError(t('manage_household.manage_members.add_member.error.select_user'))
            return
        }

        if (existingMembers.includes(selectedUser._id)) {
            setError(t('manage_household.manage_members.add_member.error.user_already_member'))
            return
        }

        if (invitedUsers.includes(selectedUser._id)) {
            setError(t('manage_household.manage_members.add_member.error.user_already_invited'))
            return
        }

        setLoading(true)
        setError(null)

        try {
            await dispatch(inviteMemberAction({ householdId, userId: selectedUser._id })).unwrap()
            toast.success(t('manage_household.manage_members.add_member.toast.invite_sent_success'))
            setSearchQuery('')
            setSelectedUser(null)
            onClose()
        } catch (err) {
            console.error(t('manage_household.manage_members.add_member.console.error_details_prefix'), err)
            const errorMessage = t('manage_household.manage_members.add_member.error.invite_send_failed')
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="invite-member-container">
            <GradientDiv className="invite-member-step-container">
                <H5 variant="primary" className="invite-member-title">
                    {t('manage_household.manage_members.add_member.invite_member')}
                </H5>
                <button className="invite-member-close-button" onClick={onClose}>
                    ×
                </button>

                <form onSubmit={handleSubmit} className="invite-member-form">
                    <div className="invite-member-form-group">
                        <div className="input-wrapper">
                            <input
                                type="text"
                                className="invite-member-input"
                                placeholder={t('manage_household.manage_members.add_member.search_placeholder')}
                                value={searchQuery}
                                onChange={e => {
                                    setSearchQuery(e.target.value)
                                    setSelectedUser(null)
                                }}
                            />
                            {searchResults.length > 0 && !selectedUser && (
                                <div className="search-results">
                                    {searchResults.map(user => (
                                        <div
                                            key={user._id}
                                            className="search-result-item"
                                            onClick={() => {
                                                console.log('Selected user:', user)
                                                setSelectedUser(user)
                                                setSearchQuery(`${user.name} ${user.surname}`)
                                                setSearchResults([])
                                            }}>
                                            <div style={{ fontWeight: 'bold' }}>
                                                {user.name} {user.surname}
                                            </div>
                                            <div style={{ fontSize: '0.9em', color: '#999' }}>{user.email}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Button
                            variant="default"
                            onClick={handleSubmit}
                            disabled={loading || !selectedUser}
                            type="submit">
                            {loading
                                ? t('manage_household.manage_members.add_member.sending_button')
                                : t('manage_household.manage_members.add_member.invite_button')}
                        </Button>
                    </div>
                    {error && <div className="invite-member-error-message">{error}</div>}
                </form>
            </GradientDiv>
        </div>
    )
}

export default InviteMember
