import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../../components/Button/Button'
import { H3, H5 } from '../../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../../i18n'
import { loadHouseholds } from '../../../redux/slices/householdsSlice'
import { fetchUsers } from '../../../redux/slices/usersSlice'
import { AppDispatch, RootState } from '../../../redux/store/store'

import './ManageMembers.sass'

const ManageMembers: React.FC = () => {
    const { t } = useTranslation() as { t: TranslationFunction }
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const { householdId } = useParams<{ householdId: string }>()
    const { households, loading: householdsLoading } = useSelector((state: RootState) => state.households)
    const { users, loading: usersLoading } = useSelector((state: RootState) => state.users)
    const { user } = useSelector((state: RootState) => state.auth)
    const [newMemberEmail, setNewMemberEmail] = useState('')

    const household = households.find(h => h.id === householdId)
    const isOwner = household?.owner === user?.id

    useEffect(() => {
        dispatch(loadHouseholds())
    }, [dispatch])

    useEffect(() => {
        if (household?.members) {
            dispatch(fetchUsers(household.members))
        }
    }, [dispatch, household])

    useEffect(() => {
        if (household && !isOwner && !householdsLoading) {
            navigate('/households-list')
        }
    }, [household, isOwner, householdsLoading, navigate])

    const handleRemoveMember = (memberId: string) => {
        // TODO: Implement remove member functionality
        console.log('Remove member:', memberId)
    }

    const handleMakeOwner = (memberId: string) => {
        // TODO: Implement make owner functionality
        console.log('Make owner:', memberId)
    }

    const handleAddMember = () => {
        // TODO: Implement add member functionality
        console.log('Add member with email:', newMemberEmail)
        setNewMemberEmail('')
    }

    const getMemberName = (memberId: string) => {
        if (householdsLoading || usersLoading) return 'Načítavam...'
        const user = users[memberId]
        return user ? `${user.name} ${user.surname}` : 'Neznámy používateľ'
    }

    if (householdsLoading) {
        return <div>Načítavam dáta...</div>
    }

    if (!household) {
        return <div>Domácnosť sa nenašla</div>
    }

    if (!isOwner) {
        return <div>Nemáte oprávnenie na správu tejto domácnosti</div>
    }

    return (
        <div className="manage-members-container">
            <H3 variant="secondary" className="manage-members-title">
                {t('manage_household.manage_members.title')} {household.name}
            </H3>

            <div className="manage-members-content">
                <div className="members-section">
                    <div className="section-content">
                        <H5 className="section-title">{t('manage_household.manage_members.household_members')}</H5>
                        <div className="members-list">
                            {household.members.map(memberId => (
                                <div key={memberId} className="member-item">
                                    <span className="member-name">{getMemberName(memberId)}</span>
                                    {memberId === household.owner && (
                                        <span className="owner-tag">
                                            {t('manage_household.manage_members.roles.owner')}
                                        </span>
                                    )}
                                    {memberId !== household.owner && (
                                        <div className="member-actions">
                                            <Button
                                                variant="default"
                                                className="make-owner-button"
                                                onClick={() => handleMakeOwner(memberId)}>
                                                {t('manage_household.manage_members.actions.make_owner')}
                                            </Button>
                                            <Button
                                                variant="default"
                                                className="remove-button"
                                                onClick={() => handleRemoveMember(memberId)}>
                                                {t('manage_household.manage_members.actions.remove')}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="add-member-section">
                    <div className="section-content">
                        <H5 className="section-title">{t('manage_household.manage_members.add_member.title')}</H5>
                        <div className="add-member-form">
                            <input
                                type="email"
                                value={newMemberEmail}
                                onChange={e => setNewMemberEmail(e.target.value)}
                                placeholder={t('manage_household.manage_members.add_member.input')}
                                className="email-input"
                            />
                            <Button variant="default" className="add-button" onClick={handleAddMember}>
                                {t('manage_household.manage_members.add_member.button')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManageMembers
